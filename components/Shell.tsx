import Link from "next/link";
import { logout } from "@/app/actions";

const links = [
  { href: "/", id: "bord", label: "Tableau de bord", icon: "grid" },
  { href: "/commandes", id: "commandes", label: "Commandes", icon: "bag" },
  { href: "/clients", id: "clients", label: "Clients", icon: "users" },
  { href: "/visiteurs", id: "visiteurs", label: "Visiteurs", icon: "eye" },
  { href: "/produits", id: "produits", label: "Produits", icon: "box" },
  { href: "/categories", id: "categories", label: "Catégories", icon: "tiles" },
  { href: "/avis", id: "avis", label: "Avis & Notes", icon: "star" },
  { href: "/promotions", id: "promotions", label: "Codes promo", icon: "tag" },
  { href: "/rapports", id: "rapports", label: "Rapports", icon: "chart" },
  { href: "/parametres", id: "parametres", label: "Paramètres", icon: "gear" },
] as const;

export type NavId = (typeof links)[number]["id"];

function Icon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5" {...common} />
        <rect x="14" y="4" width="6" height="6" rx="1.5" {...common} />
        <rect x="4" y="14" width="6" height="6" rx="1.5" {...common} />
        <rect x="14" y="14" width="6" height="6" rx="1.5" {...common} />
      </svg>
    );
  }
  if (name === "bag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 8h12l-1 12H7L6 8z" {...common} />
        <path d="M9 8V7a3 3 0 0 1 6 0v1" {...common} />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" {...common} />
        <path d="M4 18c.6-2.4 2.4-3.5 5-3.5s4.4 1.1 5 3.5" {...common} />
        <circle cx="17" cy="9" r="2.2" {...common} />
        <path d="M16 14.6c1.8.3 3 1.4 3.6 3.4" {...common} />
      </svg>
    );
  }
  if (name === "box") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8l8-4 8 4-8 4-8-4z" {...common} />
        <path d="M4 8v8l8 4 8-4V8" {...common} />
        <path d="M12 12v8" {...common} />
      </svg>
    );
  }
  if (name === "tiles") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.5" {...common} />
        <rect x="13" y="4" width="7" height="7" rx="1.5" {...common} />
        <rect x="4" y="13" width="7" height="7" rx="1.5" {...common} />
        <rect x="13" y="13" width="7" height="7" rx="1.5" {...common} />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.5l1.8 4.2 4.6.5-3.4 3.1.9 4.5L12 14.6 7.9 16.8l.9-4.5L5.4 9.2l4.6-.5L12 4.5z" {...common} />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12V5h7l8 8-7 7-8-8z" {...common} />
        <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "eye") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" {...common} />
        <circle cx="12" cy="12" r="2.5" {...common} />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V9M12 19V5M19 19v-7" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" {...common} />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4" {...common} />
    </svg>
  );
}

export function Shell({
  active,
  freshOrders,
  children,
}: {
  active: NavId;
  freshOrders: number;
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <aside className="side">
        <Link href="/" className="logo">
          <span className="logo-star" aria-hidden="true">✦</span>
          <strong>FEVYORA</strong>
          <small>MORE THAN FASHION</small>
        </Link>
        <nav>
          {links.map((link) => (
            <Link key={link.id} href={link.href} className={link.id === active ? "active" : ""}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
              {link.id === "commandes" && freshOrders > 0 ? <em>{freshOrders}</em> : null}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <div className="admin-card">
            <span aria-hidden="true">⌂</span>
            <strong>FEVYORA Admin</strong>
            <p>Gérez votre boutique en toute simplicité</p>
          </div>
          <form action={logout}>
            <button type="submit">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <div className="workspace">
        <header className="top">
          <form className="search" action="/recherche" method="get">
            <span aria-hidden="true">⌕</span>
            <input name="q" type="search" placeholder="Rechercher..." />
          </form>
          <Link href="/commandes" className="bell" aria-label="Nouvelles commandes">
            ⌁
            {freshOrders > 0 ? <em>{freshOrders}</em> : null}
          </Link>
          <div className="who">
            <span>A</span>
            <strong>Admin</strong>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
