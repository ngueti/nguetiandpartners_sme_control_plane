import { q } from "./db";
import { FORM_LABELS, countryName, siteUrl, type FormId } from "./config";

type SubLike = {
  id: string; ref: string; form: FormId; country: string; full_name: string; email: string;
  company?: string | null; subject?: string | null; priority: string;
};

/**
 * Synchronisations optionnelles (activées par variables d’environnement) :
 *  - Linear : un ticket par réclamation (et par candidature) dans l’équipe LINEAR_TEAM_ID
 *  - Notion : une ligne par soumission dans la base NOTION_DATABASE_ID
 * Les échecs sont journalisés mais ne bloquent jamais le demandeur.
 */
export async function syncExternal(s: SubLike) {
  const external: Record<string, string> = {};
  const jobs: Promise<void>[] = [];

  if (process.env.LINEAR_API_KEY && process.env.LINEAR_TEAM_ID && (s.form === "reclamation" || s.form === "enrolement")) {
    jobs.push(
      (async () => {
        const r = await fetch("https://api.linear.app/graphql", {
          method: "POST",
          headers: { Authorization: process.env.LINEAR_API_KEY!, "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation($input: IssueCreateInput!){ issueCreate(input:$input){ success issue{ id identifier url } } }`,
            variables: {
              input: {
                teamId: process.env.LINEAR_TEAM_ID,
                title: `[${FORM_LABELS[s.form]} · ${s.country}] ${s.subject || s.company || s.full_name} — ${s.ref}`,
                description: `**${FORM_LABELS[s.form]}** — ${countryName(s.country)}\n\nDemandeur : ${s.full_name}\nDossier : ${s.ref}\n\n[Ouvrir dans le back-office](${siteUrl()}/admin/soumissions/${s.id})`,
                priority: s.priority === "haute" ? 2 : 3,
              },
            },
          }),
        });
        const j: any = await r.json();
        const issue = j?.data?.issueCreate?.issue;
        if (issue) external.linear = issue.url;
        else throw new Error(`linear: ${JSON.stringify(j).slice(0, 200)}`);
      })(),
    );
  }

  if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
    jobs.push(
      (async () => {
        const r = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
          body: JSON.stringify({
            parent: { database_id: process.env.NOTION_DATABASE_ID },
            properties: {
              Name: { title: [{ text: { content: `${s.company || s.full_name}` } }] },
              Référence: { rich_text: [{ text: { content: s.ref } }] },
              Type: { select: { name: FORM_LABELS[s.form] } },
              Pays: { select: { name: countryName(s.country) } },
              Statut: { select: { name: "Nouveau" } },
              "E-mail": { email: s.email },
            },
          }),
        });
        const j: any = await r.json();
        if (j.url) external.notion = j.url;
        else throw new Error(`notion: ${JSON.stringify(j).slice(0, 200)}`);
      })(),
    );
  }

  const results = await Promise.allSettled(jobs);
  const errors = results.filter((r) => r.status === "rejected").map((r) => String((r as PromiseRejectedResult).reason?.message ?? "erreur"));
  if (Object.keys(external).length) await q(`UPDATE submissions SET external = $2::jsonb WHERE id = $1`, [s.id, JSON.stringify(external)]);
  for (const e of errors) await q(`INSERT INTO submission_events (submission_id, actor, kind, payload) VALUES ($1,'system','sync_error',$2::jsonb)`, [s.id, JSON.stringify({ error: e })]);
}
