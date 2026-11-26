import { Frame } from "@/components/Frame";
import { OrdersTable } from "@/components/Widgets";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Frame active="commandes">
      {({ orders }) => (
        <>
          <div className="hello"><h1>Commandes</h1></div>
          <article className="panel">
            <OrdersTable orders={orders} />
          </article>
        </>
      )}
    </Frame>
  );
}
