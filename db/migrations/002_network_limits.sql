CREATE TABLE inquiry_network_limit (
  key text PRIMARY KEY CHECK (key ~ '^[0-9a-f]{64}$'),
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts BETWEEN 1 AND 6),
  expires_at timestamptz NOT NULL
);
CREATE INDEX inquiry_network_limit_expiry_idx ON inquiry_network_limit (expires_at);
