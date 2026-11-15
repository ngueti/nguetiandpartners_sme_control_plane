CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref           text UNIQUE NOT NULL,
  form          text NOT NULL CHECK (form IN ('enrolement','reclamation','contact','documents')),
  country       text NOT NULL CHECK (country IN ('CM','CI','BJ')),
  status        text NOT NULL DEFAULT 'nouveau',
  priority      text NOT NULL DEFAULT 'normale',
  full_name     text NOT NULL,
  email         text NOT NULL,
  phone         text,
  company       text,
  subject       text,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  assigned_to   uuid,
  consent_at    timestamptz NOT NULL DEFAULT now(),
  ip_hash       text,
  user_agent    text,
  external      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submissions_form_idx    ON submissions (form, created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_country_idx ON submissions (country, created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_status_idx  ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_email_idx   ON submissions (lower(email));
CREATE INDEX IF NOT EXISTS submissions_ip_idx      ON submissions (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  field         text,
  filename      text NOT NULL,
  mime          text NOT NULL,
  size          integer NOT NULL,
  sha256        text NOT NULL,
  data          bytea NOT NULL,
  ip_hash       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attachments_sub_idx ON attachments (submission_id);
CREATE INDEX IF NOT EXISTS attachments_orphan_idx ON attachments (created_at) WHERE submission_id IS NULL;
CREATE INDEX IF NOT EXISTS attachments_ip_idx ON attachments (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL CHECK (role IN ('super_admin','manager','agent','lecteur')),
  countries     text[] NOT NULL DEFAULT '{}',
  active        boolean NOT NULL DEFAULT true,
  last_login    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_events (
  id            bigserial PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  actor         text NOT NULL,
  kind          text NOT NULL,
  payload       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_sub_idx ON submission_events (submission_id, created_at);

CREATE TABLE IF NOT EXISTS email_log (
  id            bigserial PRIMARY KEY,
  submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL,
  kind          text NOT NULL,
  recipient     text NOT NULL,
  subject       text NOT NULL,
  provider_id   text,
  status        text NOT NULL,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id            bigserial PRIMARY KEY,
  user_id       uuid,
  user_email    text,
  action        text NOT NULL,
  target        text,
  meta          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_ip_idx ON audit_log (action, ip_hash, created_at);
