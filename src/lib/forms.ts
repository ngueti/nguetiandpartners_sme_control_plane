import { COUNTRIES, type FormId } from "./config";

export type Option = { value: string; label: string; hint?: string; icon?: string };
export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "radio" | "multi" | "file";
  required?: boolean;
  options?: Option[];
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  maxFiles?: number;
  showIf?: { field: string; equals: string };
};
export type Step = { id: string; title: string; subtitle?: string; icon: string; fields: Field[] };
export type FormDef = {
  id: FormId;
  title: string;
  intro: string;
  submitLabel: string;
  steps: Step[];
};

const countryField: Field = {
  name: "country",
  label: "Votre pays",
  type: "radio",
  required: true,
  options: COUNTRIES.map((c) => ({ value: c.code, label: c.name, icon: c.flag, hint: c.city })),
};

const O = (...pairs: [string, string?][]): Option[] => pairs.map(([label, hint]) => ({ value: label, label, hint }));

const consent: Field = {
  name: "consent",
  label: "J’accepte que Ngueti & Partners traite ces informations pour répondre à ma demande, conformément à la politique de confidentialité.",
  type: "radio",
  required: true,
  options: [{ value: "oui", label: "J’accepte" }],
};

export const FORMS: Record<FormId, FormDef> = {
  enrolement: {
    id: "enrolement",
    title: "Rejoindre l’univers N&P",
    intro: "Cinq minutes. Aucune obligation. Vous restez maître de votre réponse à chaque étape.",
    submitLabel: "Envoyer ma candidature",
    steps: [
      {
        id: "vous",
        title: "Vous",
        subtitle: "Qui sommes-nous heureux de rencontrer ?",
        icon: "person",
        fields: [
          { name: "fullName", label: "Nom et prénom", type: "text", required: true, maxLength: 120, placeholder: "Ex. Awa Koné" },
          {
            name: "role",
            label: "Votre rôle",
            type: "radio",
            required: true,
            options: O(["Fondateur / dirigeant"], ["Co-fondateur"], ["Gérant"], ["Autre"]),
          },
          { name: "phone", label: "Téléphone / WhatsApp", type: "tel", required: true, maxLength: 30, placeholder: "+225 …" },
          { name: "email", label: "E-mail", type: "email", required: true, maxLength: 160 },
          countryField,
          { name: "city", label: "Ville", type: "text", required: true, maxLength: 80 },
        ],
      },
      {
        id: "entreprise",
        title: "Votre activité",
        subtitle: "Atelier, boutique, entreprise : dites-nous ce que vous faites.",
        icon: "shop",
        fields: [
          { name: "company", label: "Nom de l’entreprise ou de l’atelier", type: "text", required: true, maxLength: 160 },
          {
            name: "profile",
            label: "Vous êtes…",
            type: "radio",
            required: true,
            options: [
              { value: "artisan", label: "Artisan", icon: "🛠️" },
              { value: "tpe", label: "TPE", icon: "🏪" },
              { value: "pme", label: "PME", icon: "🏭" },
            ],
          },
          {
            name: "sector",
            label: "Secteur",
            type: "select",
            required: true,
            options: O(
              ["Agro-transformation"], ["Artisanat & métiers d’art"], ["Bâtiment & matériaux"], ["Commerce & distribution"],
              ["Énergie & environnement"], ["Mode & textile"], ["Numérique & services"], ["Restauration & hôtellerie"],
              ["Santé & bien-être"], ["Transport & logistique"], ["Autre"],
            ),
          },
          { name: "yearsActive", label: "Années d’activité", type: "select", required: true, options: O(["Moins de 1 an"], ["1 à 3 ans"], ["3 à 5 ans"], ["5 à 10 ans"], ["Plus de 10 ans"]) },
          { name: "headcount", label: "Équipe", type: "select", required: true, options: O(["Moi seul(e)"], ["2 à 5 personnes"], ["6 à 20 personnes"], ["21 à 50 personnes"], ["Plus de 50 personnes"]) },
          {
            name: "revenue",
            label: "Chiffre d’affaires annuel (approximatif)",
            type: "select",
            required: true,
            options: O(["Moins de 5 M FCFA"], ["5 à 25 M FCFA"], ["25 à 100 M FCFA"], ["100 à 500 M FCFA"], ["Plus de 500 M FCFA"], ["Je préfère ne pas dire"]),
          },
          {
            name: "legalStatus",
            label: "Situation légale",
            type: "radio",
            required: true,
            options: O(["Immatriculée (RCCM)"], ["Immatriculation en cours"], ["Pas encore formalisée"]),
          },
          { name: "website", label: "Site web ou page sociale (facultatif)", type: "text", maxLength: 200 },
        ],
      },
      {
        id: "situation",
        title: "Votre situation",
        subtitle: "Avec vos mots, sans jargon.",
        icon: "compass",
        fields: [
          {
            name: "triggers",
            label: "Qu’est-ce qui vous amène ? (plusieurs choix possibles)",
            type: "multi",
            required: true,
            options: O(
              ["Croissance"], ["Désorganisation"], ["Succession"], ["Qualité"], ["Financement"], ["Nouveau marché"], ["Numérique"], ["Exigence d’un client ou fournisseur"],
            ),
          },
          { name: "problem1", label: "Votre problème n°1", type: "textarea", required: true, maxLength: 400 },
          { name: "problem2", label: "Votre problème n°2 (facultatif)", type: "textarea", maxLength: 400 },
          { name: "problem3", label: "Votre problème n°3 (facultatif)", type: "textarea", maxLength: 400 },
          {
            name: "principle25",
            label: "Le modèle N&P : nous entrons à vos côtés avec une participation d’au moins 25 %, annoncée dès le départ, avant tout audit. Qu’en pensez-vous ?",
            type: "radio",
            required: true,
            options: [
              { value: "oui", label: "Oui, je suis ouvert(e)", icon: "✅" },
              { value: "a_negocier", label: "À discuter ensemble", icon: "🤝" },
              { value: "non", label: "Non, pas pour l’instant", icon: "⏸️" },
            ],
          },
          {
            name: "dataAvailable",
            label: "Que pouvez-vous nous montrer aujourd’hui ?",
            type: "multi",
            options: O(["États financiers"], ["Relevés bancaires"], ["Ventes"], ["Stocks"], ["Paie"], ["Contrats"], ["Fiscalité"], ["Production"]),
          },
          {
            name: "litigation",
            label: "Existe-t-il un litige, une dette importante ou un conflit en cours ?",
            type: "radio",
            required: true,
            options: O(["Non"], ["Oui"]),
          },
          { name: "litigationDetail", label: "En deux mots, de quoi s’agit-il ? (sans nom de tiers)", type: "textarea", maxLength: 400, showIf: { field: "litigation", equals: "Oui" } },
        ],
      },
      {
        id: "pieces",
        title: "Vos pièces",
        subtitle: "Facultatif : photo, PDF, 4 Mo max par fichier. Pas de pièce d’identité, pas de données de santé. Vous pourrez compléter plus tard.",
        icon: "paperclip",
        fields: [
          { name: "docLegal", label: "RCCM et statuts de l’entreprise", type: "file", maxFiles: 3 },
          { name: "docFinance", label: "États financiers, relevés, ventes", type: "file", maxFiles: 3 },
          { name: "docPhotos", label: "Photos de votre activité, de vos produits", type: "file", maxFiles: 4 },
        ],
      },
      { id: "envoi", title: "Envoi", subtitle: "Dernière étape.", icon: "send", fields: [consent] },
    ],
  },

  reclamation: {
    id: "reclamation",
    title: "Faire une réclamation",
    intro: "Une réclamation est un droit. Elle est lue par une personne, avec un numéro de suivi et un accusé de réception immédiat.",
    submitLabel: "Envoyer ma réclamation",
    steps: [
      {
        id: "vous",
        title: "Vous",
        icon: "person",
        fields: [
          { name: "fullName", label: "Nom et prénom", type: "text", required: true, maxLength: 120 },
          { name: "email", label: "E-mail", type: "email", required: true, maxLength: 160 },
          { name: "phone", label: "Téléphone / WhatsApp", type: "tel", maxLength: 30 },
          { ...countryField, label: "Pays du bureau concerné" },
          { name: "company", label: "Entreprise (facultatif)", type: "text", maxLength: 160 },
          {
            name: "relation",
            label: "Vous êtes…",
            type: "radio",
            required: true,
            options: O(["Entreprise du programme"], ["Candidat"], ["Partenaire"], ["Autre"]),
          },
          { name: "reference", label: "Numéro de dossier (facultatif)", type: "text", maxLength: 40, placeholder: "NP-CI-…" },
        ],
      },
      {
        id: "reclamation",
        title: "Votre réclamation",
        icon: "megaphone",
        fields: [
          {
            name: "category",
            label: "Sujet",
            type: "select",
            required: true,
            options: O(
              ["Délai de réponse"], ["Comportement ou éthique"], ["Conditions ou participation"], ["Commission ou facturation"],
              ["Données personnelles"], ["Qualité de l’accompagnement"], ["Autre"],
            ),
          },
          {
            name: "urgency",
            label: "Urgence",
            type: "radio",
            required: true,
            options: [
              { value: "normale", label: "Normale", icon: "🟢" },
              { value: "haute", label: "Urgente", icon: "🟠" },
            ],
          },
          { name: "subject", label: "Titre en une phrase", type: "text", required: true, maxLength: 160 },
          { name: "description", label: "Que s’est-il passé ?", type: "textarea", required: true, maxLength: 3000 },
          { name: "outcome", label: "Qu’attendez-vous de nous ?", type: "textarea", required: true, maxLength: 1000 },
        ],
      },
      {
        id: "preuves",
        title: "Preuves",
        subtitle: "Facultatif : captures, photos, documents (4 Mo max chacun).",
        icon: "paperclip",
        fields: [{ name: "evidence", label: "Pièces justificatives", type: "file", maxFiles: 5 }],
      },
      { id: "envoi", title: "Envoi", icon: "send", fields: [consent] },
    ],
  },

  contact: {
    id: "contact",
    title: "Nous contacter",
    intro: "Une question, une idée de partenariat ? Écrivez au bureau de votre pays.",
    submitLabel: "Envoyer le message",
    steps: [
      {
        id: "message",
        title: "Message",
        icon: "chat",
        fields: [
          { name: "fullName", label: "Nom et prénom", type: "text", required: true, maxLength: 120 },
          { name: "email", label: "E-mail", type: "email", required: true, maxLength: 160 },
          { name: "phone", label: "Téléphone / WhatsApp (facultatif)", type: "tel", maxLength: 30 },
          { ...countryField, label: "Bureau à contacter" },
          {
            name: "topic",
            label: "Sujet",
            type: "select",
            required: true,
            options: O(["Rejoindre le programme"], ["Partenariat (banque, institution, grande entreprise)"], ["Presse et événements"], ["Autre"]),
          },
          { name: "message", label: "Votre message", type: "textarea", required: true, maxLength: 3000 },
          consent,
        ],
      },
    ],
  },

  documents: {
    id: "documents",
    title: "Compléter mon dossier",
    intro: "Envoyez vos pièces en toute sécurité depuis un téléphone ou un ordinateur. Votre numéro de dossier et l’e-mail utilisé à l’inscription sont nécessaires.",
    submitLabel: "Envoyer mes pièces",
    steps: [
      {
        id: "dossier",
        title: "Dossier",
        icon: "folder",
        fields: [
          { name: "reference", label: "Numéro de dossier", type: "text", required: true, maxLength: 40, placeholder: "NP-CI-…" },
          { name: "email", label: "E-mail utilisé à l’inscription", type: "email", required: true, maxLength: 160 },
          {
            name: "docType",
            label: "Type de pièces",
            type: "select",
            required: true,
            options: O(
              ["Juridique (RCCM, statuts, pouvoirs)"], ["Finance (états financiers, relevés, balances)"], ["Fiscal et social"],
              ["Contrats et clients"], ["Opérations (stocks, production, qualité)"], ["Photos et supports"], ["Autre"],
            ),
          },
          { name: "files", label: "Vos fichiers", type: "file", required: true, maxFiles: 8 },
          { name: "comment", label: "Un commentaire ? (facultatif)", type: "textarea", maxLength: 1000 },
          consent,
        ],
      },
    ],
  },
};

export const allFields = (f: FormDef) => f.steps.flatMap((s) => s.fields);

/** Colonnes dénormalisées de la table submissions, alimentées par certains champs. */
export function coreOf(form: FormId, d: Record<string, unknown>) {
  const s = (k: string) => (typeof d[k] === "string" && d[k] ? (d[k] as string) : null);
  return {
    full_name: s("fullName") ?? "—",
    email: (s("email") ?? "").toLowerCase(),
    phone: s("phone"),
    company: s("company"),
    subject:
      form === "reclamation" ? s("subject") : form === "contact" ? s("topic") : form === "enrolement" ? s("sector") : s("docType"),
  };
}
