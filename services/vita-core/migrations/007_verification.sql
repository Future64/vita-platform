-- VITA Platform — Identity Verification by Sponsorship (Parrainage)

-- Demandes de vérification
CREATE TABLE IF NOT EXISTS demandes_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demandeur_id UUID NOT NULL REFERENCES users(id),
    message_personnel TEXT,
    parrainages_requis INTEGER DEFAULT 3,
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN (
        'en_attente', 'complete', 'expiree', 'annulee'
    )),
    date_expiration TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parrainages
CREATE TABLE IF NOT EXISTS parrainages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id UUID NOT NULL REFERENCES demandes_verification(id) ON DELETE CASCADE,
    parrain_id UUID NOT NULL REFERENCES users(id),
    statut VARCHAR(20) DEFAULT 'invite' CHECK (statut IN (
        'invite', 'en_attente', 'accepte', 'refuse', 'expire'
    )),
    lien_avec_demandeur VARCHAR(50),
    commentaire TEXT,
    date_invitation TIMESTAMPTZ DEFAULT NOW(),
    date_reponse TIMESTAMPTZ,
    UNIQUE(demande_id, parrain_id)
);

-- Historique des vérifications
CREATE TABLE IF NOT EXISTS historique_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    methode VARCHAR(30) NOT NULL,
    statut VARCHAR(20) NOT NULL,
    details TEXT,
    parrains JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compteur annuel de parrainages par citoyen
CREATE TABLE IF NOT EXISTS compteur_parrainages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parrain_id UUID NOT NULL REFERENCES users(id),
    annee INTEGER NOT NULL,
    nombre INTEGER DEFAULT 0,
    UNIQUE(parrain_id, annee)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_demandes_demandeur ON demandes_verification(demandeur_id);
CREATE INDEX IF NOT EXISTS idx_parrainages_parrain ON parrainages(parrain_id);
CREATE INDEX IF NOT EXISTS idx_parrainages_demande ON parrainages(demande_id);
CREATE INDEX IF NOT EXISTS idx_historique_verif_user ON historique_verifications(user_id);
