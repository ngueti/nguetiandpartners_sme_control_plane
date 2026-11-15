import type { Metadata, Viewport } from "next";
import { Michroma, Outfit } from "next/font/google";
import "./globals.css";

const display = Michroma({ weight: "400", subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = Outfit({ subsets: ["latin"], variable: "--f-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "Ngueti & Partners — N&P SME Control Plane", template: "%s · Ngueti & Partners" },
  description:
    "Artisans, TPE et PME d’Afrique : rejoignez l’univers Ngueti & Partners. Un partenaire qui investit à vos côtés, structure votre entreprise en 100 jours et vous laisse aux commandes. Cameroun · Côte d’Ivoire · Bénin.",
  openGraph: { title: "Ngueti & Partners — Grandissons ensemble", type: "website", locale: "fr_FR", siteName: "Ngueti & Partners" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#0f3e66", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
