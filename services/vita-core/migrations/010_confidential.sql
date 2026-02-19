-- VITA Platform — Confidential transactions (Pedersen commitments + range proofs)
-- This is an experimental overlay. The classical transaction system continues
-- to work. Confidential mode is opt-in per transaction.

-- ── 1. Confidential columns on transactions ─────────────────────────
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commitment    VARCHAR(256);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS range_proof   TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS confidentiel  BOOLEAN DEFAULT FALSE;

-- ── 2. Blinding factors (encrypted, per-user) ──────────────────────
CREATE TABLE IF NOT EXISTS blinding_factors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    encrypted_factor TEXT NOT NULL,  -- encrypted with the user's key
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(transaction_id, user_id)
);

CREATE INDEX idx_blinding_factors_tx   ON blinding_factors (transaction_id);
CREATE INDEX idx_blinding_factors_user ON blinding_factors (user_id);
