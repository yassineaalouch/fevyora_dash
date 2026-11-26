export function money(value: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function when(value: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function dayLabel(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(value).replace(".", "");
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "C";
}

export type Period = "tout" | "semaine" | "mois";

export function periodOf(value: string | undefined): Period {
  if (value === "semaine" || value === "mois") return value;
  return "tout";
}

export function periodStart(period: Period, now = new Date()) {
  if (period === "tout") return null;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (period === "semaine" ? 6 : 29));
  return start;
}

export function inPeriod(iso: string, start: Date | null) {
  if (!start) return true;
  return new Date(iso).getTime() >= start.getTime();
}

export function lastDays(count: number, now = new Date()) {
  const days: Date[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - index);
    days.push(day);
  }
  return days;
}

export function sameDay(iso: string, day: Date) {
  const date = new Date(iso);
  return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
}

export function change(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "nouveau" : "";
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return "";
  return `${percent > 0 ? "+" : ""}${percent}%`;
}
