import { createCoupon, removeCoupon } from "@/app/actions";
import { Frame } from "@/components/Frame";
import { listCoupons } from "@/lib/shop-data";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  code: "Le code doit faire 3 à 20 lettres ou chiffres.",
  valeur: "Vérifie la réduction, le minimum et la limite.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const params = await searchParams;
  const notice = params.erreur ? errors[params.erreur] ?? (params.erreur.length < 140 ? params.erreur : "") : "";
  return (
    <Frame active="promotions">
      {() => <CouponAdmin notice={notice} />}
    </Frame>
  );
}

async function CouponAdmin({ notice }: { notice: string }) {
  const coupons = await listCoupons();
  return (
    <>
      <div className="hello">
        <div>
          <h1>Codes promo</h1>
          <p>Le client écrit le code dans le panier. La réduction est calculée au moment de la commande.</p>
        </div>
      </div>
      {coupons === null ? (
        <article className="panel"><p className="empty">La table des codes n&apos;est pas encore créée. Lance le fichier supabase/shop.sql dans Supabase.</p></article>
      ) : (
        <>
          {notice ? <p className="error">{notice}</p> : null}
          <form className="panel admin-form" action={createCoupon}>
            <div className="form-grid">
              <label>Code<input name="code" required placeholder="BIENVENUE10" /></label>
              <label>
                Type
                <select name="kind" defaultValue="percent">
                  <option value="percent">Pourcentage</option>
                  <option value="fixed">Montant MAD</option>
                </select>
              </label>
              <label>Valeur<input name="amount" type="number" min="1" step="1" required /></label>
              <label>Minimum MAD<input name="minTotal" type="number" min="0" step="1" defaultValue="0" /></label>
              <label>Nombre d&apos;utilisations<input name="usageLimit" type="number" min="1" step="1" placeholder="Illimité" /></label>
              <label>Expire le<input name="expires" type="date" /></label>
            </div>
            <p><button type="submit">Ajouter le code</button></p>
          </form>
          <div className="stack">
            {coupons.length === 0 ? <p className="empty">Aucun code pour le moment.</p> : coupons.map((coupon) => (
              <article key={coupon.id} className="panel" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <strong>{coupon.code}</strong>
                  <p className="note">
                    {coupon.kind === "percent" ? `−${coupon.amount}%` : `−${coupon.amount} MAD`}
                    {coupon.min_total ? ` · dès ${coupon.min_total} MAD` : ""}
                    {coupon.usage_limit ? ` · ${coupon.used_count}/${coupon.usage_limit}` : ` · ${coupon.used_count} utilisation${coupon.used_count > 1 ? "s" : ""}`}
                    {coupon.expires_at ? ` · jusqu'au ${new Date(coupon.expires_at).toLocaleDateString("fr-MA")}` : ""}
                  </p>
                </div>
                <form action={removeCoupon}>
                  <input type="hidden" name="code" value={coupon.code} />
                  <button className="ghost" type="submit">Retirer</button>
                </form>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
