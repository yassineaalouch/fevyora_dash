import { Frame } from "@/components/Frame";
import { OrdersTable } from "@/components/Widgets";
import { initials, when } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  return (
    <Frame active="bord">
      {({ orders, clients }) => {
        const foundOrders = query
          ? orders.filter((order) =>
              `${order.customer_name} ${order.phone} ${order.city} ${order.id}`.toLowerCase().includes(query),
            )
          : [];
        const foundClients = query
          ? clients.filter((client) => `${client.fullName} ${client.email} ${client.phone}`.toLowerCase().includes(query))
          : [];
        return (
          <>
            <div className="hello">
              <div>
                <h1>Recherche</h1>
                <p>{query ? `Résultats pour « ${q.trim()} »` : "Écris un nom, un téléphone ou une ville."}</p>
              </div>
            </div>
            <article className="panel">
              <h2>Commandes</h2>
              <OrdersTable orders={foundOrders} />
            </article>
            <article className="panel" style={{ marginTop: 14 }}>
              <h2>Clients</h2>
              {foundClients.length === 0 ? <p className="empty">Aucun client.</p> : (
                <ul className="people">
                  {foundClients.map((client) => (
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
          </>
        );
      }}
    </Frame>
  );
}
