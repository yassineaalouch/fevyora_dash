"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, isAuthed, setSession, updateOrderStatus } from "@/lib/orders";
import { deleteCoupon, deleteProduct, insertCoupon, insertProduct } from "@/lib/shop-data";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password !== process.env.DASHBOARD_PASSWORD) {
    redirect("/?erreur=1");
  }
  await setSession();
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function saveStatus(formData: FormData) {
  if (!(await isAuthed())) redirect("/");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  await updateOrderStatus(id, status);
  revalidatePath("/");
  revalidatePath("/commandes");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function createProduct(formData: FormData) {
  if (!(await isAuthed())) redirect("/");
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price"));
  const compareRaw = String(formData.get("compareAt") ?? "").trim();
  const compareAt = compareRaw ? Number(compareRaw) : null;
  const collection = String(formData.get("collection") ?? "");
  const image = String(formData.get("image") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((size) => size.trim().toUpperCase())
    .filter(Boolean);
  const allowed = ["abayas-robes", "ensembles", "jupes-tops", "vestes-manteaux"];
  if (name.length < 2) redirect("/produits?erreur=nom");
  if (!Number.isInteger(price) || price < 0) redirect("/produits?erreur=prix");
  if (compareAt !== null && (!Number.isInteger(compareAt) || compareAt < price)) redirect("/produits?erreur=prix");
  if (!allowed.includes(collection)) redirect("/produits?erreur=categorie");
  if (image && !/^https?:\/\//.test(image)) redirect("/produits?erreur=image");
  const slug = slugify(name);
  if (slug.length < 2) redirect("/produits?erreur=nom");
  try {
    await insertProduct({
      slug,
      name,
      price,
      compare_at: compareAt,
      collection,
      image,
      detail,
      sizes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    redirect(`/produits?erreur=${encodeURIComponent(message || "enregistrement")}`);
  }
  revalidatePath("/produits");
  revalidatePath("/");
}

export async function removeProduct(formData: FormData) {
  if (!(await isAuthed())) redirect("/");
  const slug = String(formData.get("slug") ?? "");
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) redirect("/produits");
  await deleteProduct(slug);
  revalidatePath("/produits");
  revalidatePath("/");
}

export async function createCoupon(formData: FormData) {
  if (!(await isAuthed())) redirect("/");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const kind = String(formData.get("kind") ?? "");
  const amount = Number(formData.get("amount"));
  const minTotal = Number(formData.get("minTotal") || 0);
  const limitRaw = String(formData.get("usageLimit") ?? "").trim();
  const expiresRaw = String(formData.get("expires") ?? "").trim();
  if (!/^[A-Z0-9-]{3,20}$/.test(code)) redirect("/promotions?erreur=code");
  if (kind !== "percent" && kind !== "fixed") redirect("/promotions?erreur=valeur");
  if (!Number.isInteger(amount) || amount < 1 || (kind === "percent" && amount > 100)) redirect("/promotions?erreur=valeur");
  if (!Number.isInteger(minTotal) || minTotal < 0) redirect("/promotions?erreur=valeur");
  const usageLimit = limitRaw ? Number(limitRaw) : null;
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) redirect("/promotions?erreur=valeur");
  try {
    await insertCoupon({
      code,
      kind,
      amount,
      min_total: minTotal,
      usage_limit: usageLimit,
      expires_at: expiresRaw ? new Date(expiresRaw).toISOString() : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    redirect(`/promotions?erreur=${encodeURIComponent(message || "enregistrement")}`);
  }
  revalidatePath("/promotions");
}

export async function removeCoupon(formData: FormData) {
  if (!(await isAuthed())) redirect("/");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,20}$/.test(code)) redirect("/promotions");
  await deleteCoupon(code);
  revalidatePath("/promotions");
}
