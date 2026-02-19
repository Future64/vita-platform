-- VITA Platform — Cryptographic signing & Merkle tree integrity
-- Adds encrypted private keys to users, signature fields to transactions,
-- and Merkle tree tables for immutable transaction history verification.

-- ── 1. Add crypto columns to users ─────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_private_key TEXT;

-- ── 2. Add signature columns to transactions ────────────────────────
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS signature     VARCHAR(128);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payload_hash  VARCHAR(64);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS signer_pubkey VARCHAR(64);

-- ── 3. Merkle tree nodes ────────────────────────────────────────────
CREATE TABLE merkle_nodes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    racine_id   UUID NOT NULL,        -- FK added after merkle_racines exists
    position    INTEGER NOT NULL,      -- level-order index inside the tree
    niveau      INTEGER NOT NULL,      -- 0 = leaf, max = root
    hash        VARCHAR(64) NOT NULL,  -- SHA-256 hex
    gauche_id   UUID REFERENCES merkle_nodes(id),
    droite_id   UUID REFERENCES merkle_nodes(id),
    tx_id       UUID REFERENCES transactions(id),  -- non-null only for leaves
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merkle_nodes_racine   ON merkle_nodes (racine_id);
CREATE INDEX idx_merkle_nodes_tx       ON merkle_nodes (tx_id);
CREATE INDEX idx_merkle_nodes_niveau   ON merkle_nodes (niveau);

-- ── 4. Merkle tree roots ────────────────────────────────────────────
CREATE TABLE merkle_racines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL UNIQUE,
    racine_hash     VARCHAR(64) NOT NULL,
    nombre_feuilles INTEGER NOT NULL,
    nombre_niveaux  INTEGER NOT NULL,
    verifie         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merkle_racines_date ON merkle_racines (date);

-- ── 5. Add FK from merkle_nodes → merkle_racines ───────────────────
ALTER TABLE merkle_nodes
    ADD CONSTRAINT fk_merkle_nodes_racine
    FOREIGN KEY (racine_id) REFERENCES merkle_racines(id);
