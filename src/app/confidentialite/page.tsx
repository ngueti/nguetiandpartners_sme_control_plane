import type { Metadata } from "next";
import { Header, Footer } from "../../components/SiteChrome";
import { COUNTRIES, GENERAL_EMAIL, SUPPORT_EMAIL } from "../../lib/config";

export const metadata: Metadata = { title: "Confidentialité", description: "Comment Ngueti & Partners traite vos données personnelles : finalités, destinataires, transferts, durées, droits et contacts par pays." };

const VERSION = "Version 1.0 · 16 novembre 2026";

const sections: { t: string; body: React.ReactNode }[] = [
  {
    t: "Qui est responsable de vos données ?",
    body: (
      <>
        <p>Ngueti &amp; Partners, par le bureau du pays que vous choisissez dans nos formulaires (Cameroun, Côte d’Ivoire ou Bénin). Les entités locales du groupe sont indépendantes et certaines sont en cours de constitution : l’entité responsable dans votre pays vous est précisée lors de votre premier échange avec nous.</p>
        <p>Contact général : <a href={`mailto:${GENERAL_EMAIL}`}>{GENERAL_EMAIL}</a> · Support : <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Les adresses de chaque pays sont en bas de cette page.</p>
      </>
    ),
  },
  {
    t: "Ce que nous collectons",
    body: (
      <ul>
        <li><strong>Vous :</strong> nom, rôle, téléphone, e-mail, pays, ville.</li>
        <li><strong>Votre activité :</strong> nom de l’entreprise, secteur, ancienneté, effectif, tranche de chiffre d’affaires, situation légale, site web.</li>
        <li><strong>Votre situation :</strong> vos difficultés, ce qui vous amène, votre position sur la participation de N&amp;P, les documents dont vous disposez, l’existence éventuelle d’un litige.</li>
        <li><strong>Vos pièces (facultatives) :</strong> RCCM, statuts, états financiers, relevés, photos de votre activité.</li>
        <li><strong>Vos réclamations et messages</strong>, avec leurs pièces justificatives.</li>
        <li><strong>Données techniques :</strong> une empreinte pseudonymisée de votre adresse IP (nous ne conservons pas l’adresse en clair) et le type de navigateur, uniquement pour limiter les abus.</li>
      </ul>
    ),
  },
  {
    t: "À éviter dans vos messages et pièces",
    body: <p>Merci de ne pas saisir de données de santé ni d’opinions, ni de données personnelles de tiers (salariés, clients) qui ne sont pas indispensables. N’envoyez pas de pièce d’identité : nous ne la demandons pas à ce stade. Ce service s’adresse aux personnes majeures.</p>,
  },
  {
    t: "Pourquoi, et sur quelle base",
    body: (
      <ul>
        <li>Étudier votre candidature, vous répondre, suivre votre dossier et organiser les échanges avec l’équipe de votre pays : <strong>votre consentement</strong>, et les démarches préalables à un éventuel accord que vous demandez.</li>
        <li>Traiter vos réclamations : <strong>votre demande</strong> et votre consentement.</li>
        <li>Protéger le site contre les abus et en assurer la sécurité : notre obligation de sécuriser les données que vous nous confiez.</li>
      </ul>
    ),
  },
  {
    t: "Consentement",
    body: <p>Vous cochez une case avant chaque envoi. Vous pouvez retirer votre consentement à tout moment en écrivant au bureau de votre pays ; le retrait n’affecte pas ce qui a été fait avant. Nous n’utilisons pas vos données pour de la publicité et nous ne les vendons pas.</p>,
  },
  {
    t: "Qui y accède, et où elles sont traitées",
    body: (
      <>
        <p>Les équipes de Ngueti &amp; Partners du pays concerné, avec des accès nominatifs et un journal des consultations, téléchargements et exports. Nous faisons appel à des prestataires techniques, dont les sociétés sont établies hors de vos pays :</p>
        <ul>
          <li><strong>Vercel</strong> (hébergement du site, serveurs à Francfort, Allemagne ; société américaine) ;</li>
          <li><strong>Neon</strong> (base de données, hébergée chez AWS à Francfort, Allemagne ; société américaine) ;</li>
          <li><strong>Resend</strong> (envoi des e-mails, région Europe ; société américaine).</li>
        </ul>
        <p>Nos équipes peuvent aussi suivre un dossier dans des outils internes (Linear, Notion, messagerie professionnelle), uniquement pour le traiter.</p>
        <p>Vos données quittent donc votre pays. Ces prestataires agissent pour notre compte. Les connexions sont chiffrées (TLS) et l’accès à l’espace équipe est protégé par mot de passe. Les formalités et garanties applicables à ces transferts dans chaque pays sont en cours de finalisation avec nos conseils juridiques locaux.</p>
      </>
    ),
  },
  {
    t: "Combien de temps",
    body: <p>Le temps strictement nécessaire à l’examen de votre dossier, puis selon les obligations légales applicables. Nous arrêtons actuellement les durées exactes avec nos conseils juridiques locaux et les publierons ici. Vous pouvez à tout moment demander la suppression de votre dossier.</p>,
  },
  {
    t: "Cookies et stockage local",
    body: <p>Aucun cookie publicitaire, aucun outil de mesure d’audience. Vos réponses à un formulaire sont gardées dans votre navigateur (stockage local) pour que vous ne les perdiez pas ; elles y restent tant que vous ne les envoyez pas ou ne videz pas votre navigateur. Sur un ordinateur partagé, videz-le après usage. Le diagnostic éclair de la page d’accueil ne quitte jamais votre navigateur. Seule l’équipe reçoit un cookie de session, nécessaire à la connexion.</p>,
  },
  {
    t: "Vos droits",
    body: <p>Selon la loi de votre pays : accéder à vos données, les faire rectifier ou supprimer, vous opposer à leur traitement, retirer votre consentement, et saisir l’autorité de protection des données. Écrivez au bureau de votre pays en indiquant votre numéro de dossier ; nous vous répondons le plus vite possible. En cas de désaccord, vous pouvez saisir l’autorité de votre pays.</p>,
  },
];

const countries = [
  {
    code: "CI",
    law: "Loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel. L’autorité de contrôle est l’ARTCI (Autorité de protection des données).",
    note: "Les transferts de données hors de Côte d’Ivoire sont encadrés par cette loi : nous vous informons ici que les vôtres sont hébergés à l’étranger, comme indiqué plus haut.",
  },
  {
    code: "CM",
    law: "Loi camerounaise n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère personnel, sous le contrôle de l’autorité de protection des données compétente.",
    note: "Certains de nos prestataires sont des sociétés étrangères : vos données peuvent être traitées hors du Cameroun.",
  },
  {
    code: "BJ",
    law: "Loi n° 2017-20 portant Code du numérique du Bénin (livre consacré à la protection des données à caractère personnel), sous le contrôle de l’APDP (Autorité de protection des données à caractère personnel).",
    note: "Certains de nos prestataires sont situés ou rattachés à des sociétés hors du Bénin : ces transferts sont soumis à la réglementation applicable.",
  },
];

export default function Page() {
  return (
    <>
      <Header />
      <main className="pt-[68px]">
        <div className="bg-[var(--navy)] py-14 text-white">
          <div className="wrap max-w-[860px]">
            <span className="eyebrow">Transparence</span>
            <h1 className="mt-3 text-[clamp(24px,5vw,44px)] text-white">Confidentialité</h1>
            <p className="mt-3 text-[15px] text-white/70">{VERSION}</p>
          </div>
        </div>
        <div className="wrap max-w-[860px] py-12 sm:py-14">
          <p className="rounded-2xl bg-[var(--sand)] p-5 text-[17px] text-[var(--ink)]">En deux phrases : vous nous confiez des informations pour que nous puissions vous répondre et étudier votre dossier. Nous ne les vendons pas, nous ne faisons pas de publicité avec, et vous gardez la main dessus.</p>
          <div className="legal mt-10 grid gap-9">
            {sections.map((s) => (
              <section key={s.t}>
                <h2 className="text-[19px] font-bold normal-case tracking-normal text-[var(--navy)]">{s.t}</h2>
                <div className="mt-2 grid gap-3 text-[17px] leading-relaxed">{s.body}</div>
              </section>
            ))}
            <section>
              <h2 className="text-[19px] font-bold normal-case tracking-normal text-[var(--navy)]">Selon votre pays</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-3">
                {countries.map((c) => {
                  const co = COUNTRIES.find((x) => x.code === c.code)!;
                  return (
                    <article key={c.code} className="rounded-2xl border border-[var(--line)] p-5">
                      <h3 className="text-[15px] normal-case tracking-normal"><span aria-hidden="true">{co.flag}</span> {co.name}</h3>
                      <p className="mt-2 text-[16px] leading-relaxed">{c.law}</p>
                      <p className="mt-2 text-[16px] leading-relaxed text-[var(--muted)]">{c.note}</p>
                      <p className="mt-3 break-all text-[15px]"><a className="font-semibold text-[var(--navy)] underline underline-offset-4" href={`mailto:${co.email}`}>{co.email}</a></p>
                    </article>
                  );
                })}
              </div>
            </section>
            <p className="border-t border-[var(--line)] pt-6 text-[15px] text-[var(--muted)]">Cette politique peut évoluer, notamment lorsque nos durées de conservation et les formalités auprès des autorités seront arrêtées ; la date de version ci-dessus fait foi.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
