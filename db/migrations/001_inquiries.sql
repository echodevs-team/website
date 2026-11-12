CREATE TABLE inquiries (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  email text CHECK (email IS NULL OR char_length(email) BETWEEN 3 AND 254),
  phone text CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{6,14}$'),
  service text NOT NULL CHECK (service IN ('website','custom_software','ai_automation','not_sure')),
  budget_range text CHECK (budget_range IN ('not_sure','small','medium','large')),
  timeline text CHECK (timeline IS NULL OR char_length(timeline) BETWEEN 1 AND 120),
  description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 20 AND 5000),
  locale text NOT NULL CHECK (locale IN ('fa','en','ar')),
  source_page text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed','spam')),
  CHECK (email IS NOT NULL OR phone IS NOT NULL),
  CHECK (source_page IN ('/' || locale, '/' || locale || '/contact'))
);
CREATE INDEX inquiries_created_at_idx ON inquiries (created_at);
CREATE INDEX inquiries_status_idx ON inquiries (status);

-- No contact fields/raw IPs in ephemeral submission or abuse metadata.
CREATE TABLE inquiry_submissions (
  key uuid PRIMARY KEY,
  digest text NOT NULL CHECK (digest ~ '^[0-9a-f]{64}$'),
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX inquiry_submissions_expiry_idx ON inquiry_submissions (expires_at);

-- One shared global bucket; bounded cardinality, no IP/proxy trust assumptions.
CREATE TABLE inquiry_rate_limit (
  key text PRIMARY KEY CHECK (key = 'global'),
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0)
);
