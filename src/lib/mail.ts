import { q } from "./db";
import { COUNTRIES, GENERAL_EMAIL, SUPPORT_EMAIL, FORM_LABELS, countryName, siteUrl, type FormId } from "./config";
import { FORMS, allFields } from "./forms";

const NAVY = "#0f3e66";
const ORANGE = "#e97b02";
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Sub = {
  id: string; ref: string; form: FormId; country: string; full_name: string; email: string;
  phone?: string | null; company?: string | null; subject?: string | null; priority: string; data: Record<string, any>;
  fileCount: number;
};

function layout(title: string, bodyHtml: string, preheader = "") {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f6f9;font-family:Segoe UI,Arial,sans-serif;color:#17283a">
<span style="display:none;opacity:0;height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(15,62,102,.10)">
<tr><td style="background:${NAVY};padding:22px 28px">
  <table role="presentation" width="100%"><tr>
   <td><span style="display:inline-block;width:34px;height:34px;border-radius:50%;background:linear-gradient(90deg,#fadc2c,${ORANGE});vertical-align:middle;position:relative"><span style="display:block;width:24px;height:24px;border-radius:50%;background:${NAVY};margin:5px"></span></span>
   <span style="color:#fff;font-weight:700;letter-spacing:.12em;font-size:15px;vertical-align:middle;margin-left:10px">NGUETI &amp; PARTNERS</span></td>
  </tr></table></td></tr>
<tr><td style="height:5px;background:linear-gradient(90deg,#fadc2c,${ORANGE})"></td></tr>
<tr><td style="padding:30px 28px 8px"><h1 style="margin:0 0 14px;font-size:22px;color:${NAVY}">${esc(title)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:18px 28px 28px;color:#6b7c8e;font-size:12px;border-top:1px solid #eef1f5">
Ngueti &amp; Partners · N&amp;P SME Control Plane™<br>Cameroun · Côte d’Ivoire · Bénin<br>
<a href="mailto:${GENERAL_EMAIL}" style="color:${NAVY}">${GENERAL_EMAIL}</a> · <a href="mailto:${SUPPORT_EMAIL}" style="color:${NAVY}">${SUPPORT_EMAIL}</a><br>
<a href="${siteUrl()}" style="color:${NAVY}">${siteUrl().replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;
}

const refBadge = (ref: string) =>
  `<p style="margin:18px 0;padding:14px 18px;background:#fff7ec;border-left:4px solid ${ORANGE};border-radius:8px;font-size:15px">Votre numéro de dossier<br><strong style="font-size:20px;letter-spacing:.06em;color:${NAVY}">${esc(ref)}</strong></p>`;

export function ackEmail(s: Sub): { subject: string; html: string; text: string } {
  const first = s.full_name.split(" ")[0];
  const nextByForm: Record<FormId, string> = {
    enrolement:
      "Un membre de l’équipe de votre pays lit votre candidature et revient vers vous sous 5 jours ouvrés pour un premier échange. Vous pouvez compléter votre dossier à tout moment avec vos pièces.",
    reclamation:
      "Votre réclamation est enregistrée et sera lue par une personne de l’équipe. Nous vous répondons sous 5 jours ouvrés (2 jours si vous l’avez signalée comme urgente).",
    contact: "Votre message a bien été transmis au bureau concerné. Nous vous répondons sous 3 jours ouvrés.",
    documents: "Vos pièces ont été ajoutées à votre dossier. Nous vous prévenons si un élément manque.",
  };
  const subject = `${s.form === "reclamation" ? "Réclamation reçue" : s.form === "documents" ? "Pièces reçues" : "Bien reçu"} · ${s.ref}`;
  const extra =
    s.form === "enrolement"
      ? `<p style="margin:0 0 12px">Rappel de notre engagement : N&amp;P prend une participation d’au moins 25 %, annoncée dès le départ, avant tout audit. Nous ne promettons ni financement, ni contrat que nous ne maîtrisons pas.</p>`
      : "";
  const html = layout(
    `Merci ${first}, c’est bien reçu.`,
    `<p style="margin:0 0 12px;line-height:1.6">${esc(nextByForm[s.form])}</p>${refBadge(s.ref)}${extra}
     <p style="margin:0 0 12px;line-height:1.6">Pour compléter votre dossier ou répondre à un échange, conservez ce numéro.${
       s.form !== "documents" ? ` <a href="${siteUrl()}/documents" style="color:${NAVY};font-weight:600">Envoyer des pièces</a>` : ""
     }</p>`,
    `Votre numéro de dossier : ${s.ref}`,
  );
  const text = `Merci ${first}.\n\n${nextByForm[s.form]}\n\nNuméro de dossier : ${s.ref}\n\nNgueti & Partners`;
  return { subject, html, text };
}

export function teamEmail(s: Sub, adminUrl: string): { subject: string; html: string; text: string } {
  const def = FORMS[s.form];
  const rows = allFields(def)
    .filter((f) => f.type !== "file" && s.data[f.name] !== undefined && s.data[f.name] !== "" && f.name !== "consent")
    .map((f) => {
      const v = Array.isArray(s.data[f.name]) ? s.data[f.name].join(", ") : s.data[f.name];
      return `<tr><td style="padding:6px 10px;color:#6b7c8e;font-size:13px;vertical-align:top;width:38%">${esc(f.label.slice(0, 70))}</td><td style="padding:6px 10px;font-size:14px">${esc(v)}</td></tr>`;
    })
    .join("");
  const urgent = s.priority === "haute";
  const subject = `${urgent ? "🟠 URGENT · " : ""}[${FORM_LABELS[s.form]} · ${s.country}] ${s.company || s.full_name} · ${s.ref}`;
  const html = layout(
    `${FORM_LABELS[s.form]} — ${countryName(s.country)}`,
    `${refBadge(s.ref)}
     <table role="presentation" width="100%" style="border-collapse:collapse;background:#f8fafc;border-radius:10px">${rows}</table>
     <p style="margin:16px 0 4px;font-size:14px">📎 ${s.fileCount} pièce(s) jointe(s)</p>
     <p style="margin:18px 0"><a href="${adminUrl}" style="background:${NAVY};color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">Ouvrir dans le back-office</a></p>
     <p style="color:#6b7c8e;font-size:12px">Répondre à cet e-mail écrit directement au demandeur (${esc(s.email)}).</p>`,
    `${s.full_name} — ${s.ref}`,
  );
  const text = `${FORM_LABELS[s.form]} ${s.ref}\n${s.full_name} <${s.email}>\n${adminUrl}`;
  return { subject, html, text };
}

export const officeEmail = (country: string) => COUNTRIES.find((c) => c.code === country)?.email ?? GENERAL_EMAIL;

export const teamAddress = (country: string): string | null =>
  process.env[`TEAM_EMAIL_${country}`] || process.env.TEAM_EMAIL_DEFAULT || null;

export async function sendMail(opts: {
  to: string; subject: string; html: string; text: string; replyTo?: string; kind: string; submissionId?: string | null;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Ngueti & Partners <onboarding@resend.dev>";
  let status = "sent", providerId: string | null = null, error: string | null = null;
  if (!key) {
    status = "skipped";
    error = "RESEND_API_KEY non configurée";
  } else {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text, reply_to: opts.replyTo }),
      });
      const j: any = await r.json().catch(() => ({}));
      if (r.ok) providerId = j.id ?? null;
      else {
        status = "failed";
        error = String(j.message ?? r.status).slice(0, 300);
      }
    } catch (e: any) {
      status = "failed";
      error = String(e?.message ?? e).slice(0, 300);
    }
  }
  try {
    await q(`INSERT INTO email_log (submission_id, kind, recipient, subject, provider_id, status, error) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
      opts.submissionId ?? null, opts.kind, opts.to, opts.subject, providerId, status, error,
    ]);
  } catch {}
  return status === "sent";
}
