import { Login, Setup } from "@/components/Gate";
import { Shell, type NavId } from "@/components/Shell";
import { adminData } from "@/lib/guard";
import type { ClientAccount, Order } from "@/lib/orders";

export async function Frame({
  active,
  children,
}: {
  active: NavId;
  children: (data: { orders: Order[]; clients: ClientAccount[] }) => React.ReactNode;
}) {
  const state = await adminData();
  if (state.kind === "setup") return <Setup missing={state.missing} />;
  if (state.kind === "login") return <Login />;
  if (state.kind === "error") {
    return (
      <Shell active={active} freshOrders={0}>
        <p className="empty">{state.message}</p>
      </Shell>
    );
  }
  const fresh = state.orders.filter((order) => order.status === "nouvelle").length;
  return (
    <Shell active={active} freshOrders={fresh}>
      {children(state)}
    </Shell>
  );
}
