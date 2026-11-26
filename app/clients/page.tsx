import { Frame } from "@/components/Frame";
import { initials, when } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Frame active="clients">
      {({ clients }) => (
        <>
          <div className="hello">
            <div>
              <h1>Clients</h1>
              <p>{clients.length} compte{clients.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <article className="panel">
            {clients.length === 0 ? <p className="empty">Aucun compte client pour le moment.</p> : (
              <ul className="people">
                {clients.map((client) => (
                  <li key={client.id}>
                    <span className="avatar">{initials(client.fullName)}</span>
                    <span>
                      <strong>{client.fullName}</strong>
                      <small>{client.email}{client.phone ? ` · ${client.phone}` : ""}</small>
                    </span>
                    <em>{when(client.created_at)}</em>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      )}
    </Frame>
  );
}
