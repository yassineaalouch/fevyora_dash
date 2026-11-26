import { Frame } from "@/components/Frame";
import { when } from "@/lib/format";
import { listEvents, listVisitors, type VisitEvent, type VisitorRow } from "@/lib/shop-data";

export const dynamic = "force-dynamic";

const pageNames: Record<string, string> = {
  "/": "Accueil",
  "/boutique/": "Boutique",
  "/collections/": "Collections",
  "/panier/": "Panier",
  "/favoris/": "Favoris",
  "/compte/": "Compte",
  "/contact/": "Contact",
  "/a-propos/": "À propos",
  "/recherche/": "Recherche",
  "/piece/": "Pièce",
};

function pageLabel(path: string) {
  if (pageNames[path]) return pageNames[path];
  if (path.startsWith("/produit/")) return `Produit ${path.split("/").filter(Boolean)[1] ?? ""}`;
  if (path.startsWith("/collections/")) return `Collection ${path.split("/").filter(Boolean)[1] ?? ""}`;
  return path || "Page";
}

function personKey(visitor: VisitorRow) {
  return visitor.user_id ? `compte:${visitor.user_id}` : `nav:${visitor.visitor_key}`;
}

function countBy(events: VisitEvent[], type: string, field: "path" | "slug") {
  const map = new Map<string, number>();
  for (const event of events) {
    if (event.type !== type) continue;
    const key = event[field] || "—";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function countField(rows: VisitorRow[], field: "source" | "device" | "browser" | "os") {
  const map = new Map<string, number>();
  for (const row of rows) map.set(row[field] || "Inconnu", (map.get(row[field] || "Inconnu") ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function Bars({ rows }: { rows: [string, number][] }) {
  if (rows.length === 0) return <p className="empty">Pas encore de données.</p>;
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="bars">
      {rows.slice(0, 8).map(([label, count]) => (
        <div key={label} className="bar">
          <span>{label}</span>
          <b style={{ width: `${Math.max(8, (count / max) * 100)}%` }} />
          <em>{count}</em>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <Frame active="visiteurs">
      {() => <VisitorReport />}
    </Frame>
  );
}

async function VisitorReport() {
  const [visitors, events] = await Promise.all([listVisitors(), listEvents()]);
  if (!visitors || !events) {
    return (
      <>
        <div className="hello"><h1>Visiteurs</h1></div>
        <article className="panel"><p className="empty">Les tables de visites ne sont pas encore créées. Lance le fichier supabase/shop.sql dans Supabase.</p></article>
      </>
    );
  }
  const unique = new Set(visitors.map(personKey)).size;
  const sessions = visitors.reduce((sum, visitor) => sum + (visitor.sessions || 0), 0);
  const pageViews = events.filter((event) => event.type === "page").length;
  const adds = events.filter((event) => event.type === "add_cart").length;
  const removes = events.filter((event) => event.type === "remove_cart").length;
  const pagesByVisitor = new Map<string, number>();
  for (const event of events) {
    if (event.type !== "page") continue;
    pagesByVisitor.set(event.visitor_key, (pagesByVisitor.get(event.visitor_key) ?? 0) + 1);
  }
  return (
    <>
      <div className="hello">
        <div>
          <h1>Visiteurs</h1>
          <p>Un visiteur unique est le même navigateur. S&apos;il se connecte, le téléphone et l&apos;ordinateur comptent pour une seule personne. La source n&apos;est connue que si le lien envoie Instagram, Google, ChatGPT ou un utm_source. Sinon, c&apos;est Direct.</p>
        </div>
      </div>
      <section className="stats">
        <article className="stat"><strong>{unique}</strong><small>Visiteurs uniques</small></article>
        <article className="stat"><strong>{sessions}</strong><small>Visites</small></article>
        <article className="stat"><strong>{pageViews}</strong><small>Pages vues</small></article>
        <article className="stat"><strong>{adds}</strong><small>Ajouts au panier</small></article>
      </section>
      <section className="split">
        <article className="panel">
          <h2>D&apos;où ils viennent</h2>
          <Bars rows={countField(visitors, "source")} />
        </article>
        <article className="panel">
          <h2>Téléphone ou ordinateur</h2>
          <Bars rows={countField(visitors, "device")} />
        </article>
      </section>
      <section className="split">
        <article className="panel">
          <h2>Navigateur</h2>
          <Bars rows={countField(visitors, "browser")} />
        </article>
        <article className="panel">
          <h2>Système</h2>
          <Bars rows={countField(visitors, "os")} />
        </article>
      </section>
      <section className="lower">
        <article className="panel">
          <h2>Pages vues</h2>
          <Bars rows={countBy(events, "page", "path").map(([path, count]) => [pageLabel(path), count])} />
        </article>
        <article className="panel">
          <h2>Produits vus</h2>
          <Bars rows={countBy(events, "product", "slug")} />
          <h2 style={{ marginTop: 18 }}>Panier</h2>
          <p className="note">{adds} ajout{adds > 1 ? "s" : ""} · {removes} retrait{removes > 1 ? "s" : ""}</p>
          <Bars rows={countBy(events, "add_cart", "slug")} />
        </article>
      </section>
      <article className="panel" style={{ marginTop: 14 }}>
        <h2>Chaque visiteur</h2>
        {visitors.length === 0 ? <p className="empty">Aucune visite pour le moment.</p> : (
          <ul className="people">
            {visitors.slice(0, 40).map((visitor) => (
              <li key={visitor.visitor_key}>
                <span className="avatar">{visitor.device === "Téléphone" ? "T" : "O"}</span>
                <span className="visitor">
                  <strong>{visitor.source} · {visitor.device} · {visitor.browser}</strong>
                  <small>{visitor.os} · {visitor.sessions} visite{visitor.sessions > 1 ? "s" : ""} · {pagesByVisitor.get(visitor.visitor_key) ?? 0} page{(pagesByVisitor.get(visitor.visitor_key) ?? 0) > 1 ? "s" : ""}</small>
                </span>
                <em>{when(visitor.last_seen)}</em>
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  );
}
