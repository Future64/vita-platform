-- VITA Platform — Audit Trail with Hash Chain Integrity

-- Journal d'audit avec chaîne de hachage
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_number BIGSERIAL,

    -- Qui
    acteur_id UUID REFERENCES users(id),
    acteur_username VARCHAR(50),
    acteur_role VARCHAR(30),
    acteur_ip INET,

    -- Quoi
    action VARCHAR(100) NOT NULL,
    categorie VARCHAR(30) NOT NULL CHECK (categorie IN (
        'auth', 'transaction', 'vote', 'governance', 'identity', 'admin', 'system', 'moderation'
    )),
    severite VARCHAR(10) DEFAULT 'info' CHECK (severite IN ('info', 'warning', 'critique')),

    -- Détails
    description TEXT NOT NULL,
    details JSONB,
    entite_type VARCHAR(50),
    entite_id UUID,

    -- Intégrité (chaîne de hachage SHA-512)
    hash VARCHAR(128) NOT NULL,
    hash_precedent VARCHAR(128) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_sequence ON audit_logs(sequence_number);
CREATE INDEX IF NOT EXISTS idx_audit_acteur ON audit_logs(acteur_id);
CREATE INDEX IF NOT EXISTS idx_audit_categorie ON audit_logs(categorie);
CREATE INDEX IF NOT EXISTS idx_audit_severite ON audit_logs(severite);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entite ON audit_logs(entite_type, entite_id);

-- Table singleton pour le dernier hash connu (vérification rapide)
CREATE TABLE IF NOT EXISTS audit_integrity (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_sequence BIGINT NOT NULL DEFAULT 0,
    last_hash VARCHAR(128) NOT NULL DEFAULT 'GENESIS',
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    total_entries BIGINT NOT NULL DEFAULT 0,
    integrity_ok BOOLEAN DEFAULT TRUE
);

INSERT INTO audit_integrity (last_hash) VALUES ('GENESIS') ON CONFLICT DO NOTHING;
