-- VITA Platform — Identity Provider Abstraction Layer
-- Stocke les verifications d'identite via providers externes.
-- AUCUNE donnee personnelle : uniquement le nullifier_hash.

-- ── Table principale ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS identity_verifications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vita_account_id  UUID NOT NULL REFERENCES accounts(id),
    nullifier_hash   TEXT UNIQUE NOT NULL,
    provider         TEXT NOT NULL CHECK (provider IN (
        'franceconnect', 'signicat', 'web_of_trust'
    )),
    country_code     CHAR(2),
    verified_at      TIMESTAMPTZ,
    zk_proof         JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────

-- Recherche par compte VITA (verifier si deja verifie)
CREATE INDEX IF NOT EXISTS idx_identity_verif_account
    ON identity_verifications (vita_account_id);

-- Recherche par nullifier (detection de doublon = anti-fraude)
CREATE UNIQUE INDEX IF NOT EXISTS idx_identity_verif_nullifier
    ON identity_verifications (nullifier_hash);

-- Recherche par provider + pays (statistiques)
CREATE INDEX IF NOT EXISTS idx_identity_verif_provider_country
    ON identity_verifications (provider, country_code);
