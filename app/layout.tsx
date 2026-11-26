import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin | FEVYORA",
  description: "Tableau de bord FEVYORA : commandes, clients et produits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
