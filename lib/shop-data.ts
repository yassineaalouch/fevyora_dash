export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at: number | null;
  collection: string;
  image: string;
  detail: string;
  sizes: string[];
  active: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  amount: number;
  min_total: number;
  active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
};

export type VisitorRow = {
  visitor_key: string;
  user_id: string;
  first_seen: string;
  last_seen: string;
  source: string;
  device: string;
  os: string;
  browser: string;
  sessions: number;
};

export type VisitEvent = {
  created_at: string;
  visitor_key: string;
  session_key: string;
  type: string;
  path: string;
  slug: string;
};

function config() {
  return {
    url: process.env.SUPABASE_URL?.trim() ?? "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
  };
}

function headers() {
  const { key } = config();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function rest(path: string, init?: RequestInit) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  return response;
}

async function failed(response: Response) {
  if (response.ok) return "";
  const body = await response.text();
  if (response.status === 404 || body.includes("PGRST205")) return "missing";
  if (response.status === 409 || body.includes("23505")) return "duplicate";
  return "error";
}

export async function listShopProducts(): Promise<ShopProduct[] | null> {
  const response = await rest("fevyora_products?select=*&order=created_at.desc&limit=200");
  if (!response.ok) {
    if ((await failed(response)) === "missing") return null;
    throw new Error("Impossible de lire les produits.");
  }
  return (await response.json()) as ShopProduct[];
}

export async function insertProduct(product: Omit<ShopProduct, "id" | "active"> & { active?: boolean }) {
  const response = await rest("fevyora_products", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ...product, active: true }),
  });
  const state = await failed(response);
  if (state === "missing") throw new Error("La table des produits n'existe pas encore.");
  if (state === "duplicate") throw new Error("Un produit porte déjà ce nom.");
  if (state) throw new Error("Le produit n'a pas été enregistré.");
}

export async function deleteProduct(slug: string) {
  const response = await rest(`fevyora_products?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Le produit n'a pas été retiré.");
}

export async function listCoupons(): Promise<Coupon[] | null> {
  const response = await rest("fevyora_coupons?select=*&order=created_at.desc&limit=100");
  if (!response.ok) {
    if ((await failed(response)) === "missing") return null;
    throw new Error("Impossible de lire les codes promo.");
  }
  return (await response.json()) as Coupon[];
}

export async function insertCoupon(coupon: {
  code: string;
  kind: "percent" | "fixed";
  amount: number;
  min_total: number;
  usage_limit: number | null;
  expires_at: string | null;
}) {
  const response = await rest("fevyora_coupons", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(coupon),
  });
  const state = await failed(response);
  if (state === "missing") throw new Error("La table des codes promo n'existe pas encore.");
  if (state === "duplicate") throw new Error("Ce code existe déjà.");
  if (state) throw new Error("Le code n'a pas été enregistré.");
}

export async function deleteCoupon(code: string) {
  const response = await rest(`fevyora_coupons?code=eq.${encodeURIComponent(code)}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Le code n'a pas été retiré.");
}

export async function listVisitors(): Promise<VisitorRow[] | null> {
  const response = await rest("fevyora_visitors?select=visitor_key,user_id,first_seen,last_seen,source,device,os,browser,sessions&order=last_seen.desc&limit=500");
  if (!response.ok) {
    if ((await failed(response)) === "missing") return null;
    throw new Error("Impossible de lire les visiteurs.");
  }
  return (await response.json()) as VisitorRow[];
}

export async function listEvents(): Promise<VisitEvent[] | null> {
  const response = await rest("fevyora_events?select=created_at,visitor_key,session_key,type,path,slug&order=created_at.desc&limit=2000");
  if (!response.ok) {
    if ((await failed(response)) === "missing") return null;
    throw new Error("Impossible de lire les visites.");
  }
  return (await response.json()) as VisitEvent[];
}
