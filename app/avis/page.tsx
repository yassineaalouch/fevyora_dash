import { Frame } from "@/components/Frame";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Frame active="avis">
      {() => (
        <>
          <div className="hello"><h1>Avis & Notes</h1></div>
          <article className="panel">
            <p className="empty">Aucun avis client n&apos;est encore enregistré. Les notes apparaîtront ici dès qu&apos;un client en laissera un.</p>
          </article>
        </>
      )}
    </Frame>
  );
}
