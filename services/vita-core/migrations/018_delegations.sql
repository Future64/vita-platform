-- VITA Platform — Delegation system

CREATE TABLE IF NOT EXISTS delegations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    delegate_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    scope          TEXT NOT NULL DEFAULT 'all',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (delegator_id, scope)
);

CREATE INDEX IF NOT EXISTS idx_delegations_delegate ON delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_delegations_delegator ON delegations(delegator_id);

-- View: delegation weight per account
CREATE OR REPLACE VIEW delegation_weights AS
SELECT
    delegate_id AS account_id,
    COUNT(*) AS delegation_count
FROM delegations
GROUP BY delegate_id;
