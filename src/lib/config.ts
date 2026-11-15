export const COUNTRIES = [
  { code: "CM", name: "Cameroun", flag: "🇨🇲", city: "Douala · Yaoundé" },
  { code: "CI", name: "Côte d’Ivoire", flag: "🇨🇮", city: "Abidjan" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", city: "Cotonou" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as unknown as [CountryCode, ...CountryCode[]];
export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;

export const FORM_IDS = ["enrolement", "reclamation", "contact", "documents"] as const;
export type FormId = (typeof FORM_IDS)[number];

export const FORM_LABELS: Record<FormId, string> = {
  enrolement: "Candidature",
  reclamation: "Réclamation",
  contact: "Contact",
  documents: "Pièces complémentaires",
};

export const STATUSES = [
  { value: "nouveau", label: "Nouveau", tone: "info" },
  { value: "en_cours", label: "En cours", tone: "warn" },
  { value: "attente_client", label: "En attente du demandeur", tone: "muted" },
  { value: "traite", label: "Traité", tone: "ok" },
  { value: "clos", label: "Clos", tone: "muted" },
] as const;
export const STATUS_VALUES = STATUSES.map((s) => s.value) as unknown as [string, ...string[]];
export const statusLabel = (v: string) => STATUSES.find((s) => s.value === v)?.label ?? v;

export const ROLES = ["super_admin", "manager", "agent", "lecteur"] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super administrateur",
  manager: "Responsable pays",
  agent: "Agent",
  lecteur: "Lecture seule",
};

/** Matrice de permissions granulaires du back-office. */
export const PERMS: Record<Role, { view: boolean; edit: boolean; notes: boolean; export: boolean; attachments: boolean; users: boolean; audit: boolean }> = {
  super_admin: { view: true, edit: true, notes: true, export: true, attachments: true, users: true, audit: true },
  manager: { view: true, edit: true, notes: true, export: true, attachments: true, users: false, audit: false },
  agent: { view: true, edit: true, notes: true, export: false, attachments: true, users: false, audit: false },
  lecteur: { view: true, edit: false, notes: false, export: false, attachments: true, users: false, audit: false },
};

export const SITE_NAME = "Ngueti & Partners";
export const siteUrl = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const MAX_FILE_BYTES = 4 * 1024 * 1024; // limite corps de requête serverless (4,5 Mo)
export const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};
