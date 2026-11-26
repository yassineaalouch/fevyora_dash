import { Frame } from "@/components/Frame";
import { Donut, SalesChart } from "@/components/Widgets";
import { dayLabel, lastDays, money, sameDay } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Frame active="rapports">
      {({ orders }) => {
        const days = lastDays(7);
        const sales = days.map((day) =>
          orders
            .filter((order) => order.status !== "annulee" && sameDay(order.created_at, day))
            .reduce((sum, order) => sum + order.total, 0),
        );
        const delivered = orders.filter((order) => order.status === "livree").length;
        const cancelled = orders.filter((order) => order.status === "annulee").length;
        const progress = orders.length - delivered - cancelled;
        const total = orders.filter((order) => order.status !== "annulee").reduce((sum, order) => sum + order.total, 0);
        return (
          <>
            <div className="hello">
              <div>
                <h1>Rapports</h1>
                <p>Chiffre d&apos;affaires encaissable : {money(total)}</p>
              </div>
            </div>
            <section className="split">
              <article className="panel">
                <h2>7 derniers jours</h2>
                <SalesChart days={days.map(dayLabel)} values={sales} />
              </article>
              <article className="panel">
                <h2>Statuts</h2>
                <Donut delivered={delivered} progress={progress} cancelled={cancelled} />
              </article>
            </section>
          </>
        );
      }}
    </Frame>
  );
}
