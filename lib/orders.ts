import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type OrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  note: string | null;
  items: OrderItem[];
  total: number;
  coupon_code?: string | null;
  discount?: number | null;
};

export const statuses = [
  { id: "nouvelle", label: "Nouvelle" },
  { id: "confirmee", label: "Confirmée" },
  { id: "expediee", label: "Expédiée" },
  { id: "livree", label: "Livrée" },
  { id: "annulee", label: "Annulée" },
] as const;

function config() {
  const url = process.env.SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const password = process.env.DASHBOARD_PASSWORD ?? "";
  return { url, key, password };
}

export function missingSetup() {
  const { url, key, password } = config();
  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!password) missing.push("DASHBOARD_PASSWORD");
  return missing;
}

function sessionToken(password: string) {
  return createHash("sha256").update(`fevyora-dashboard:${password}`).digest("hex");
}

export async function isAuthed() {
  const { password } = config();
  if (!password) return false;
  const jar = await cookies();
  const current = jar.get("fevyora_dashboard")?.value ?? "";
  const expected = sessionToken(password);
  if (current.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(current), Buffer.from(expected));
}

export async function setSession() {
  const { password } = config();
  const jar = await cookies();
  jar.set("fevyora_dashboard", sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete("fevyora_dashboard");
}

function headers() {
  const { key } = config();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function listOrders(): Promise<Order[]> {
  const { url } = config();
  const response = await fetch(
    `${url}/rest/v1/fevyora_orders?select=*&order=created_at.desc&limit=100`,
    { headers: headers(), cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Impossible de lire les commandes.");
  }
  return (await response.json()) as Order[];
}

export type ClientAccount = {
  id: string;
  email: string;
  created_at: string;
  fullName: string;
  phone: string;
};

export async function listClients(): Promise<ClientAccount[]> {
  const { url } = config();
  const response = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Impossible de lire les clients.");
  }
  const payload = (await response.json()) as {
    users?: {
      id: string;
      email?: string;
      created_at: string;
      user_metadata?: { full_name?: string; phone?: string };
    }[];
  };
  return (payload.users ?? [])
    .map((user) => ({
      id: user.id,
      email: user.email ?? "",
      created_at: user.created_at,
      fullName: user.user_metadata?.full_name?.trim() || "Client",
      phone: user.user_metadata?.phone?.trim() || "",
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function updateOrderStatus(id: string, status: string) {
  const { url } = config();
  const allowed = statuses.some((item) => item.id === status);
  if (!allowed) return;
  const response = await fetch(`${url}/rest/v1/fevyora_orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Le statut n'a pas été enregistré.");
  }
}
