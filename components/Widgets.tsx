import { saveStatus } from "@/app/actions";
import { statuses, type Order } from "@/lib/orders";
import { initials, money, when } from "@/lib/format";

export function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
    const y = 30 - (value / max) * 24;
    return `${x},${y}`;
  });
  const line = points.join(" ");
  const fill = `0,32 ${line} 100,32`;
  return (
    <svg className="spark" viewBox="0 0 100 32" aria-hidden="true">
      <polygon points={fill} />
      <polyline points={line} />
    </svg>
  );
}

export function SalesChart({ days, values }: { days: string[]; values: number[] }) {
  const max = Math.max(...values, 1);
  const width = 560;
  const height = 180;
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - 16 - (value / max) * (height - 36);
    return { x, y, value };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const peak = points.reduce((best, point) => (point.value >= best.value ? point : best), points[0]);
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Ventes des 7 derniers jours">
        {[0, 1, 2, 3].map((row) => (
          <line key={row} x1="0" x2={width} y1={20 + row * 40} y2={20 + row * 40} />
        ))}
        <polygon points={`0,${height} ${line} ${width},${height}`} />
        <polyline points={line} />
        {peak && peak.value > 0 ? (
          <>
            <line x1={peak.x} x2={peak.x} y1={peak.y} y2={height - 8} className="peak-line" />
            <circle cx={peak.x} cy={peak.y} r="5" />
          </>
        ) : null}
      </svg>
      {peak && peak.value > 0 ? (
        <strong className="peak" style={{ left: `${(peak.x / width) * 100}%` }}>
          {money(peak.value)}
        </strong>
      ) : null}
      <ol>
        {days.map((day) => (
          <li key={day}>{day}</li>
        ))}
      </ol>
    </div>
  );
}

export function Donut({
  delivered,
  progress,
  cancelled,
}: {
  delivered: number;
  progress: number;
  cancelled: number;
}) {
  const total = delivered + progress + cancelled;
  const parts = [delivered, progress, cancelled];
  const sum = Math.max(total, 1);
  let cursor = 0;
  const stops = total === 0
    ? ["#f3ddd6 0% 100%"]
    : ["#6d2436", "#e7b7b4", "#f3ddd6"].map((color, index) => {
        const start = cursor;
        cursor += (parts[index] / sum) * 100;
        return `${color} ${start}% ${cursor}%`;
      });
  const share = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops.join(",")})` }}>
        <div>
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>
      <ul>
        <li><i className="swatch dark" /> Livrées <b>{share(delivered)}%</b></li>
        <li><i className="swatch mid" /> En cours <b>{share(progress)}%</b></li>
        <li><i className="swatch pale" /> Annulées <b>{share(cancelled)}%</b></li>
      </ul>
    </div>
  );
}

const tones: Record<string, string> = {
  nouvelle: "wait",
  confirmee: "wait",
  expediee: "ship",
  livree: "done",
  annulee: "cancel",
};

export function statusLabel(id: string) {
  return statuses.find((status) => status.id === id)?.label ?? id;
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="empty">Aucune commande pour le moment.</p>;
  }
  return (
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
        {orders.map((order) => (
          <tr key={order.id}>
            <td>#{order.id.slice(0, 8).toUpperCase()}</td>
            <td className="who-cell">
              <span className="avatar">{initials(order.customer_name)}</span>
              <span>
                {order.customer_name}
                <small>{order.city} · {order.phone}</small>
              </span>
            </td>
            <td>
              {money(order.total)}
              {order.coupon_code ? <small> {order.coupon_code}{order.discount ? ` −${money(order.discount)}` : ""}</small> : null}
            </td>
            <td>
              <form action={saveStatus} className="status-form">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} aria-label={`Statut de ${order.customer_name}`} className={tones[order.status] ?? "wait"}>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
                <button type="submit">OK</button>
              </form>
            </td>
            <td>{when(order.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
