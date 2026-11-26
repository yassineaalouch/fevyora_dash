import { isAuthed, listClients, listOrders, missingSetup, type ClientAccount, type Order } from "@/lib/orders";

export type AdminState =
  | { kind: "setup"; missing: string[] }
  | { kind: "login" }
  | { kind: "error"; message: string }
  | { kind: "ok"; orders: Order[]; clients: ClientAccount[] };

export async function adminData(): Promise<AdminState> {
  const missing = missingSetup();
  if (missing.length > 0) return { kind: "setup", missing };
  if (!(await isAuthed())) return { kind: "login" };
  try {
    const [orders, clients] = await Promise.all([listOrders(), listClients()]);
    return { kind: "ok", orders, clients };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lecture impossible.";
    return { kind: "error", message };
  }
}
