import { Frame } from "@/components/Frame";

export const dynamic = "force-dynamic";

export default function Page() {
  const host = process.env.SUPABASE_URL?.replace(/^https?:\/\//, "") ?? "";
  return (
    <Frame active="parametres">
      {({ orders, clients }) => (
        <>
          <div className="hello"><h1>Paramètres</h1></div>
          <article className="panel">
            <p>Boutique connectée à <strong>{host}</strong>.</p>
            <p className="note">{orders.length} commandes · {clients.length} clients · paiement à la livraison.</p>
            <p className="note">Ce dashboard se déploie seul sur Vercel, dossier <code>dashboard</code>. Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DASHBOARD_PASSWORD. Le site boutique reste sur Cloudflare.</p>
          </article>
        </>
      )}
    </Frame>
  );
}
