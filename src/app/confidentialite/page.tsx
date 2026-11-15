import type { Metadata } from "next";
import { Header, Footer } from "../../components/SiteChrome";

export const metadata: Metadata = { title: "Confidentialité" };

const items = [
  ["Ce que nous collectons", "Les informations que vous saisissez dans nos formulaires (identité, coordonnées, informations sur votre activité) et les pièces que vous joignez."],
  ["Pourquoi", "Répondre à votre candidature, à votre réclamation ou à votre message, et suivre votre dossier. Rien d’autre."],
  ["Qui y accède", "Les équipes Ngueti & Partners du pays concerné, selon des droits d’accès nominatifs et journalisés. Aucune revente, aucune publicité."],
  ["Prestataires techniques", "Hébergement (Vercel), base de données chiffrée (Neon) et envoi d’e-mails (Resend), strictement pour faire fonctionner le service."],
  ["Conservation", "Le temps nécessaire au traitement de votre dossier, puis selon les obligations légales applicables dans votre pays."],
  ["Vos droits", "Accès, rectification, suppression, opposition : écrivez au bureau de votre pays via la page Contact en précisant votre numéro de dossier."],
  ["Diagnostic éclair", "Les réponses du diagnostic de la page d’accueil restent dans votre navigateur. Elles ne sont ni envoyées ni enregistrées."],
];

export default function Page() {
  return (
    <>
      <Header />
      <main className="pt-[68px]">
        <div className="bg-[var(--navy)] py-14 text-white"><div className="wrap"><span className="eyebrow">Transparence</span><h1 className="mt-3 text-[clamp(26px,5vw,44px)] text-white">Confidentialité</h1></div></div>
        <div className="wrap max-w-[760px] py-14">
          <p className="mb-8 rounded-2xl bg-[var(--sand)] p-5 text-[15px] text-[var(--muted)]">Version synthétique à faire valider par le conseil juridique local de chaque pays avant lancement public (lois nationales sur la protection des données personnelles).</p>
          <dl className="grid gap-7">
            {items.map(([t, d]) => (<div key={t}><dt className="text-[18px] font-bold text-[var(--navy)]">{t}</dt><dd className="mt-1 text-[var(--ink)]">{d}</dd></div>))}
          </dl>
        </div>
      </main>
      <Footer />
    </>
  );
}
