-- VITA Platform — Identity Provider Verification Enhancement
--
-- Ajoute le champ assurance_level a identity_verifications
-- et cree la table de sessions anti-CSRF pour le flux OAuth.

-- ── Ajout assurance_level ──────────────────────────────────────────

ALTER TABLE identity_verifications
    ADD COLUMN IF NOT EXISTS assurance_level TEXT
    CHECK (assurance_level IN ('low', 'substantial', 'high'));

-- ── Index pour recherche par assurance level ───────────────────────

CREATE INDEX IF NOT EXISTS idx_identity_verif_assurance
    ON identity_verifications (assurance_level);

-- ── Table de sessions OAuth (state anti-CSRF) ──────────────────────
-- Stocke les sessions temporaires pendant le flux OAuth2/OIDC.
-- Chaque session est nettoyee apres callback ou expiration.

CREATE TABLE IF NOT EXISTS identity_oauth_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    provider        TEXT NOT NULL,
    state           TEXT UNIQUE NOT NULL,
    nonce           TEXT NOT NULL,
    code_verifier   TEXT,
    method_id       TEXT,
    redirect_uri    TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
);

-- Lookup rapide par state (callback)
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_state
    ON identity_oauth_sessions (state);

-- Nettoyage des sessions expirees
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires
    ON identity_oauth_sessions (expires_at);
