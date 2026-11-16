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

const FONT = "Segoe UI, Helvetica, Arial, sans-serif";
const DISPLAY = "Trebuchet MS, Segoe UI, Arial, sans-serif";

/** Bouton « pilule » aux couleurs N&P (tableau : compatible Outlook/Gmail). */
export function emailButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px"><tr><td bgcolor="#f5a623" style="border-radius:999px;background:#f5a623;background-image:linear-gradient(90deg,#fadc2c,#e97b02)">
<a href="${href}" style="display:inline-block;padding:14px 30px;font-family:${DISPLAY};font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#082a47;text-decoration:none;border-radius:999px">${esc(label)}</a></td></tr></table>`;
}

/** Gabarit commun de tous les e-mails automatiques : logo officiel, couleurs et signature de la charte N&P. */
export function brandedEmail(title: string, bodyHtml: string, preheader = "") {
  const site = siteUrl();
  const offices = COUNTRIES.map((c) => `<a href="mailto:${c.email}" style="color:#ffffff;text-decoration:none"><strong style="color:#ffffff">${esc(c.name)}</strong>&nbsp;·&nbsp;${c.email}</a>`).join("<br>");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#eef3f8;font-family:${FONT};color:#15283a">
<span style="display:none;opacity:0;height:0;max-height:0;overflow:hidden;mso-hide:all">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef3f8" style="background:#eef3f8"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;border-radius:22px;overflow:hidden;background:#ffffff;box-shadow:0 10px 30px rgba(15,62,102,.14)">
<tr><td bgcolor="#0f3e66" style="background:#0f3e66;padding:26px 32px 22px">
  <a href="${site}" style="text-decoration:none"><img src="${site}/email/logo-on-dark.png" width="232" alt="Ngueti &amp; Partners" style="display:block;border:0;outline:none;width:232px;max-width:100%;height:auto"></a>
  <div style="margin-top:14px;font-family:${DISPLAY};font-size:11px;letter-spacing:.22em;color:#fadc2c;text-transform:uppercase">N&amp;P SME Control Plane™</div>
</td></tr>
<tr><td height="6" bgcolor="#f5a623" style="height:6px;line-height:6px;font-size:0;background:#f5a623;background-image:linear-gradient(90deg,#fadc2c,#e97b02)">&nbsp;</td></tr>
<tr><td style="padding:34px 32px 10px;font-family:${FONT};font-size:16px;line-height:1.65;color:#15283a">
  <h1 style="margin:0 0 16px;font-family:${DISPLAY};font-size:23px;line-height:1.25;letter-spacing:.02em;color:#0f3e66;text-transform:uppercase">${esc(title)}</h1>
  ${bodyHtml}
</td></tr>
<tr><td bgcolor="#082a47" style="background:#082a47;padding:26px 32px 28px;font-family:${FONT};font-size:12.5px;line-height:1.7;color:#c9d6e3">
  <div style="font-family:${DISPLAY};font-size:10.5px;letter-spacing:.16em;color:#fadc2c;text-transform:uppercase;line-height:1.8">Architecturer · Co-construire<br>Orchestrer · Institutionnaliser<br>Changer d’échelle</div>
  <div style="margin:16px 0 0;color:#ffffff">${offices}</div>
  <div style="margin:12px 0 0"><a href="mailto:${GENERAL_EMAIL}" style="color:#c9d6e3">${GENERAL_EMAIL}</a> · <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9d6e3">${SUPPORT_EMAIL}</a></div>
  <div style="margin:16px 0 0;padding-top:14px;border-top:1px solid rgba(255,255,255,.18);font-size:11.5px;color:#8fa6bd">Vous recevez ce message suite à une demande faite sur <a href="${site}" style="color:#c9d6e3">${site.replace(/^https?:\/\//, "")}</a>. <a href="${site}/confidentialite" style="color:#c9d6e3">Confidentialité</a> · Ngueti &amp; Partners™</div>
</td></tr>
</table></td></tr></table></body></html>`;
}
const layout = brandedEmail;

const refBadge = (ref: string, caption = "Votre numéro de dossier") =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td bgcolor="#fff8ec" style="background:#fff8ec;border-left:5px solid ${ORANGE};border-radius:10px;padding:16px 20px;font-size:14px;color:#5d7186">${esc(caption)}<br><strong style="font-family:${DISPLAY};font-size:22px;letter-spacing:.08em;color:${NAVY}">${esc(ref)}</strong></td></tr></table>`;

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
      ? `<p style="margin:0 0 12px">Rappel de notre engagement : N&amp;P prend une participation d’au moins 25&nbsp;%, annoncée dès le départ, avant tout audit. Nous ne promettons ni financement, ni contrat que nous ne maîtrisons pas.</p>`
      : "";
  const html = layout(
    `Merci ${first}, c’est bien reçu.`,
    `<p style="margin:0 0 12px;line-height:1.6">${esc(nextByForm[s.form])}</p>${refBadge(s.ref)}${extra}
     <p style="margin:0 0 4px;line-height:1.6">Pour compléter votre dossier ou répondre à un échange, conservez ce numéro. Vous pouvez répondre directement à cet e-mail : il arrive dans la boîte du bureau de votre pays.</p>${
       s.form !== "documents" ? emailButton(`${siteUrl()}/documents`, "Envoyer des pièces") : ""
     }`,
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
      const lab = (x: unknown) => f.options?.find((o) => o.value === x)?.label ?? (f.name === "country" ? countryName(String(x)) : String(x));
      const v = Array.isArray(s.data[f.name]) ? s.data[f.name].map(lab).join(", ") : lab(s.data[f.name]);
      const short = f.label.length > 58 ? f.label.slice(0, 58).replace(/\s+\S*$/, "") + "…" : f.label;
      return `<tr><td style="padding:8px 12px;color:#5d7186;font-size:13px;vertical-align:top;width:38%;border-bottom:1px solid #e3e9f0">${esc(short)}</td><td style="padding:8px 12px;font-size:14px;border-bottom:1px solid #e3e9f0">${esc(v)}</td></tr>`;
    })
    .join("");
  const urgent = s.priority === "haute";
  const subject = `${urgent ? "🟠 URGENT · " : ""}[${FORM_LABELS[s.form]} · ${s.country}] ${s.company || s.full_name} · ${s.ref}`;
  const html = layout(
    `${FORM_LABELS[s.form]} — ${countryName(s.country)}`,
    `${refBadge(s.ref, "Numéro de dossier")}
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f4f7fb;border-radius:12px">${rows}</table>
     <p style="margin:16px 0 4px;font-size:14px">📎 ${s.fileCount} pièce(s) jointe(s)</p>
     ${emailButton(adminUrl, "Ouvrir dans le back-office")}
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
