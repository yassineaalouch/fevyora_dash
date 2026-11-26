import Link from "next/link";
import { Login, Setup } from "@/components/Gate";
import { PeriodSelect } from "@/components/PeriodSelect";
import { Shell } from "@/components/Shell";
import { Donut, SalesChart, Spark } from "@/components/Widgets";
import { products } from "@/lib/catalog";
import { listShopProducts } from "@/lib/shop-data";
import { change, dayLabel, inPeriod, initials, lastDays, money, periodOf, periodStart, sameDay, when } from "@/lib/format";
import { adminData } from "@/lib/guard";
import type { Order } from "@/lib/orders";

export const dynamic = "force-dynamic";

function revenue(orders: Order[]) {
  return orders.filter((order) => order.status !== "annulee").reduce((sum, order) => sum + order.total, 0);
}

function series(orders: Order[], days: Date[]) {
  return days.map((day) =>
    orders
      .filter((order) => order.status !== "annulee" && sameDay(order.created_at, day))
      .reduce((sum, order) => sum + order.total, 0),
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; periode?: string }>;
}) {
  const params = await searchParams;
  const state = await adminData();
  if (state.kind === "setup") return <Setup missing={state.missing} />;
  if (state.kind === "login") return <Login failed={params.erreur === "1"} />;
  if (state.kind === "error") {
    return (
      <Shell active="bord" freshOrders={0}>
        <p className="empty">{state.message}</p>
      </Shell>
    );
  }

  const period = periodOf(params.periode);
  const start = periodStart(period);
  const previousStart = start ? new Date(start.getTime() - (period === "mois" ? 30 : 7) * 86400000) : null;
  const current = state.orders.filter((order) => inPeriod(order.created_at, start));
  const previous = previousStart
    ? state.orders.filter((order) => {
        const time = new Date(order.created_at).getTime();
        return time >= previousStart.getTime() && time < (start?.getTime() ?? 0);
      })
    : [];
  const days = lastDays(7);
  const sales = series(state.orders, days);
  const orderSeries = days.map((day) => state.orders.filter((order) => sameDay(order.created_at, day)).length);
  const clientSeries = days.map((day) => state.clients.filter((client) => sameDay(client.created_at, day)).length);
  const fresh = state.orders.filter((order) => order.status === "nouvelle").length;
  const delivered = current.filter((order) => order.status === "livree").length;
  const cancelled = current.filter((order) => order.status === "annulee").length;
  const progress = current.length - delivered - cancelled;
  const sold = new Map<string, number>();
  for (const order of state.orders) {
    if (order.status === "annulee" || !Array.isArray(order.items)) continue;
    for (const item of order.items) sold.set(item.slug, (sold.get(item.slug) ?? 0) + item.quantity);
  }
  const shopProducts = await listShopProducts().catch(() => null);
  const productCount = shopProducts?.filter((product) => product.active).length || products.length;
  const ranked = [...products].sort((a, b) => (sold.get(b.slug) ?? 0) - (sold.get(a.slug) ?? 0));
  const orderDelta = change(current.length, previous.length);
  const clientDelta = change(
    state.clients.filter((client) => inPeriod(client.created_at, start)).length,
    previousStart ? state.clients.filter((client) => {
      const time = new Date(client.created_at).getTime();
      return time >= previousStart.getTime() && time < (start?.getTime() ?? 0);
    }).length : 0,
  );
  const revenueDelta = change(revenue(current), revenue(previous));

  return (
    <Shell active="bord" freshOrders={fresh}>
      <div className="hello">
        <div>
          <h1>Bonjour Admin</h1>
          <p>Voici un aperçu de votre boutique.</p>
        </div>
        <PeriodSelect value={period} />
      </div>
      <section className="stats">
        <article className="stat">
          <div className="stat-top"><span>⌂</span>{orderDelta ? <b className="up">{orderDelta}</b> : null}</div>
          <strong>{current.length.toLocaleString("fr-MA")}</strong>
          <small>Commandes</small>
          <Spark values={orderSeries} />
        </article>
        <article className="stat">
          <div className="stat-top"><span>○</span>{clientDelta ? <b className="up">{clientDelta}</b> : null}</div>
          <strong>{state.clients.filter((client) => inPeriod(client.created_at, start)).length.toLocaleString("fr-MA")}</strong>
          <small>Clients</small>
          <Spark values={clientSeries} />
        </article>
        <article className="stat">
          <div className="stat-top"><span>▣</span></div>
          <strong>{productCount}</strong>
          <small>Produits</small>
          <Spark values={products.map((product) => sold.get(product.slug) ?? 0)} />
        </article>
        <article className="stat">
          <div className="stat-top"><span>¤</span>{revenueDelta ? <b className="up">{revenueDelta}</b> : null}</div>
          <strong>{money(revenue(current))}</strong>
          <small>Chiffre d&apos;affaires</small>
          <Spark values={sales} />
        </article>
      </section>
      <section className="split">
        <article className="panel">
          <div className="panel-head"><h2>Ventes sur les 7 derniers jours</h2></div>
          <SalesChart days={days.map(dayLabel)} values={sales} />
        </article>
        <article className="panel">
          <div className="panel-head"><h2>Répartition des commandes</h2></div>
          <Donut delivered={delivered} progress={progress} cancelled={cancelled} />
        </article>
      </section>
      <section className="lower">
        <article className="panel">
          <div className="panel-head">
            <h2>Dernières commandes</h2>
            <Link href="/commandes">Voir tout →</Link>
          </div>
          <table className="orders">
            <thead>
              <tr>
                <th>#Commande</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {current.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="who-cell">
                    <span className="avatar">{initials(order.customer_name)}</span>
                    <span>{order.customer_name}</span>
                  </td>
                  <td>{money(order.total)}</td>
                  <td>{order.status === "livree" ? "Livrée" : order.status === "annulee" ? "Annulée" : order.status === "expediee" ? "Expédiée" : "En cours"}</td>
                  <td>{when(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {current.length === 0 ? <p className="empty">Aucune commande sur cette période.</p> : null}
        </article>
        <article className="panel">
          <div className="panel-head">
            <h2>Nouveaux clients</h2>
            <Link href="/clients">Voir tout →</Link>
          </div>
          {state.clients.length === 0 ? <p className="empty">Aucun compte client pour le moment.</p> : (
            <ul className="people">
              {state.clients.slice(0, 5).map((client) => (
                <li key={client.id}>
                  <span className="avatar">{initials(client.fullName)}</span>
                  <span>
                    <strong>{client.fullName}</strong>
                    <small>{client.email}</small>
                  </span>
                  <em>{when(client.created_at)}</em>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
      <section className="panel" style={{ marginTop: 14 }}>
        <div className="block-head">
          <h2>Produits les plus vendus</h2>
          <Link href="/produits">Voir tout →</Link>
        </div>
        <div className="sellers">
          {ranked.slice(0, 5).map((product) => (
            <article key={product.slug} className="seller">
              <img src={product.image} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>{(sold.get(product.slug) ?? 0).toLocaleString("fr-MA")} vente{(sold.get(product.slug) ?? 0) > 1 ? "s" : ""}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}
