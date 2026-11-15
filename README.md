# N&P SME Control Plane — site d’enrôlement

Site 100 % français, graphique et animé, qui enrôle artisans, TPE et PME (Cameroun · Côte d’Ivoire · Bénin) et automatise candidatures, réclamations, contacts et dépôt de pièces. Back-office granulaire pour les équipes N&P.

## Pile
Next.js 15 (App Router) · React 19 · Tailwind v4 · Motion · Neon Postgres · Resend · Vercel.

## Pages publiques
`/` accueil graphique · `/rejoindre` candidature (5 étapes, pièces jointes) · `/reclamation` · `/contact` · `/documents` (compléter un dossier avec n° + e-mail) · `/confidentialite`.

## Back-office `/admin`
Rôles : **super_admin** (tout, équipe, journal), **manager** (pays, exports), **agent** (traitement sans export), **lecteur**. Périmètre par pays. Filtres (type, pays, statut, priorité, dates, pièces, attribution, texte libre), fiche détaillée avec visualisation des pièces (image/PDF), statut, attribution, notes, réponse e-mail via Resend, exports **CSV / JSON / ZIP des pièces**, journal d’audit (connexions, consultations, téléchargements, exports).

## Données
Tables : `submissions` (colonnes clés + `data` jsonb), `attachments` (fichiers en `bytea` dans Neon, ≤ 4 Mo, signature binaire vérifiée), `submission_events`, `email_log`, `admin_users`, `audit_log`. Schéma : `migrations/001_init.sql`.

## Démarrer
```bash
cp .env.example .env.local   # renseigner DATABASE_URL et SESSION_SECRET
npm install
npm run db:migrate
npm run db:seed-admin -- admin@exemple.com "Nom" "MotDePasseLong12+" super_admin
npm run dev
```
Hors Neon (URL sans `neon.tech`), le pilote `pg` classique est utilisé : pratique pour les tests locaux.

## Sécurité
Pot de miel + durée minimale de saisie, limitation de débit par IP hachée, validation serveur stricte (zod), contrôle des signatures de fichiers, sessions HMAC HttpOnly, mots de passe scrypt, neutralisation des formules CSV, en-têtes de sécurité, droit à l’effacement (super_admin).

## Réserves à lever avant lancement public
* Texte `/confidentialite` à valider par le conseil juridique de chaque pays.
* Aucune donnée chiffrée de marché n’est affichée : à ajouter uniquement avec preuve.
* Domaine d’envoi Resend à vérifier (sinon limité à `onboarding@resend.dev`).
