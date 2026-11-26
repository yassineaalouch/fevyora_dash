"use client";

import { useRouter } from "next/navigation";

export function PeriodSelect({ value }: { value: string }) {
  const router = useRouter();
  return (
    <label className="period">
      <span className="sr">Période</span>
      <select
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          router.push(next === "tout" ? "/" : `/?periode=${next}`);
        }}
      >
        <option value="tout">Tout</option>
        <option value="semaine">Cette semaine</option>
        <option value="mois">Ce mois</option>
      </select>
    </label>
  );
}
