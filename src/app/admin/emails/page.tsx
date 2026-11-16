import { requireUser } from "../../../lib/auth";
import { ackEmail, brandedEmail, teamEmail } from "../../../lib/mail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aperçu des e-mails" };

const sample = {
  id: "00000000-0000-0000-0000-000000000000",
  ref: "NP-CI-2611-AB3CD",
  form: "enrolement" as const,
  country: "CI",
  full_name: "Awa Koné",
  email: "awa@exemple.com",
  phone: "+225 07 00 00 00 00",
  company: "Atelier Awa",
  subject: "Mode & textile",
  priority: "normale",
  fileCount: 2,
  data: {
    fullName: "Awa Koné", role: "Fondateur / dirigeant", country: "CI", city: "Abidjan", company: "Atelier Awa", profile: "artisan",
    sector: "Mode & textile", yearsActive: "3 à 5 ans", headcount: "2 à 5 personnes", principle25: "oui", problem1: "Je gère tout seule et je perds des commandes.",
  },
};

export default async function EmailPreview() {
  await requireUser("audit");
  const base = process.env.SITE_URL || "http://localhost:3000";
  const reply = brandedEmail(
    "Votre dossier NP-CI-2611-AB3CD",
    `<p style="margin:0 0 14px">Bonjour Awa,</p><p style="margin:0 0 14px">Merci pour votre candidature. Nous vous proposons un premier échange jeudi à 10 h.</p><p style="margin:22px 0 4px"><strong style="color:#0f3e66">Prénom Nom</strong><br>Ngueti &amp; Partners · Côte d’Ivoire</p>`,
    "Réponse de l’équipe Ngueti & Partners",
  );
  const items = [
    { t: "Accusé de réception — candidature", html: ackEmail(sample).html },
    { t: "Accusé de réception — réclamation", html: ackEmail({ ...sample, form: "reclamation", priority: "haute" }).html },
    { t: "Alerte équipe pays", html: teamEmail(sample, `${base}/admin/soumissions/${sample.id}`).html },
    { t: "Réponse de l’équipe au demandeur", html: reply },
  ];
  return (
    <div className="grid gap-6">
      <h1 className="text-[26px] font-extrabold text-[var(--navy)]">Aperçu des e-mails automatiques</h1>
      <p className="text-[var(--muted)]">Rendu des quatre gabarits avec des données d’exemple. Aucun envoi.</p>
      <div className="grid gap-6 xl:grid-cols-2">
        {items.map((i) => (
          <section key={i.t} className="adm-card !p-0 overflow-hidden">
            <h2 className="border-b border-[var(--line)] p-4 text-[15px] font-bold text-[var(--navy)]">{i.t}</h2>
            <iframe title={i.t} srcDoc={i.html} sandbox="" className="h-[820px] w-full border-0 bg-[#eef3f8]" />
          </section>
        ))}
      </div>
    </div>
  );
}
