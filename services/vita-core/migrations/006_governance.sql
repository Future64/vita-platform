-- VITA Platform — Governance: Doléances, Propositions, Votes, Discussions, Paramètres

-- ── Doléances ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doleances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    auteur_id UUID NOT NULL REFERENCES users(id),
    categorie VARCHAR(30) NOT NULL CHECK (categorie IN (
        'economie', 'gouvernance', 'technique', 'social',
        'ecologie', 'education', 'sante', 'autre'
    )),
    soutiens INTEGER DEFAULT 0,
    seuil_proposition INTEGER DEFAULT 100,
    statut VARCHAR(20) DEFAULT 'ouverte' CHECK (statut IN (
        'ouverte', 'seuil_atteint', 'convertie', 'fermee'
    )),
    proposition_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS soutiens_doleance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doleance_id UUID NOT NULL REFERENCES doleances(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doleance_id, user_id)
);

-- ── Propositions ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS propositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    auteur_id UUID NOT NULL REFERENCES users(id),
    type_proposition VARCHAR(30) DEFAULT 'standard' CHECK (type_proposition IN (
        'standard', 'constitutionnel', 'urgent', 'modification_parametre'
    )),
    categorie VARCHAR(30),
    statut VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN (
        'brouillon', 'discussion', 'vote', 'adopte', 'rejete', 'annule'
    )),

    -- Paramètres de vote
    duree_vote_jours INTEGER DEFAULT 7,
    quorum_requis DECIMAL(5,2) DEFAULT 50.00,
    seuil_adoption DECIMAL(5,2) DEFAULT 50.00,

    -- Dates
    date_debut_discussion TIMESTAMPTZ,
    date_debut_vote TIMESTAMPTZ,
    date_fin_vote TIMESTAMPTZ,
    date_cloture TIMESTAMPTZ,

    -- Si modification_parametre
    parametre_cible VARCHAR(100),
    valeur_actuelle TEXT,
    valeur_proposee TEXT,
    justification_parametre TEXT,

    -- Lien doléance
    doleance_source_id UUID REFERENCES doleances(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Votes ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposition_id UUID NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    choix VARCHAR(15) NOT NULL CHECK (choix IN ('pour', 'contre', 'abstention')),
    poids DECIMAL(10,4) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(proposition_id, user_id)
);

-- ── Fils de discussion ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fils_discussion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposition_id UUID NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
    auteur_id UUID NOT NULL REFERENCES users(id),
    sujet VARCHAR(200) NOT NULL,
    categorie VARCHAR(30) DEFAULT 'general' CHECK (categorie IN (
        'argument_pour', 'argument_contre', 'question',
        'proposition_amendement', 'technique', 'general'
    )),
    epingle BOOLEAN DEFAULT FALSE,
    resolu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages_discussion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fil_id UUID NOT NULL REFERENCES fils_discussion(id) ON DELETE CASCADE,
    auteur_id UUID NOT NULL REFERENCES users(id),
    contenu TEXT NOT NULL,
    reponse_a UUID REFERENCES messages_discussion(id),
    modifie BOOLEAN DEFAULT FALSE,
    reactions_approuve INTEGER DEFAULT 0,
    reactions_pertinent INTEGER DEFAULT 0,
    reactions_desaccord INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Paramètres système versionnés ──────────────────────────────────

CREATE TABLE IF NOT EXISTS parametres_systeme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT NOT NULL,
    categorie VARCHAR(20) NOT NULL CHECK (categorie IN ('immuable', 'gouvernance', 'technique')),
    description TEXT,
    type_valeur VARCHAR(20) DEFAULT 'integer' CHECK (type_valeur IN (
        'integer', 'decimal', 'boolean', 'string', 'duration'
    )),
    valeur_min TEXT,
    valeur_max TEXT,
    unite VARCHAR(50),
    quorum_modification DECIMAL(5,2),
    derniere_modification TIMESTAMPTZ DEFAULT NOW(),
    modifie_par_vote_id UUID REFERENCES propositions(id)
);

CREATE TABLE IF NOT EXISTS historique_parametres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parametre_id UUID NOT NULL REFERENCES parametres_systeme(id),
    ancienne_valeur TEXT NOT NULL,
    nouvelle_valeur TEXT NOT NULL,
    proposition_id UUID REFERENCES propositions(id),
    date_modification TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_propositions_statut ON propositions(statut);
CREATE INDEX IF NOT EXISTS idx_propositions_auteur ON propositions(auteur_id);
CREATE INDEX IF NOT EXISTS idx_votes_proposition ON votes(proposition_id);
CREATE INDEX IF NOT EXISTS idx_doleances_statut ON doleances(statut);
CREATE INDEX IF NOT EXISTS idx_fils_proposition ON fils_discussion(proposition_id);
CREATE INDEX IF NOT EXISTS idx_messages_fil ON messages_discussion(fil_id);

-- ── Insertion des paramètres initiaux ──────────────────────────────

INSERT INTO parametres_systeme (nom, valeur, categorie, description, type_valeur, valeur_min, valeur_max, unite, quorum_modification) VALUES
-- Immuables
('emission_quotidienne', '1', 'immuable', '1 Ѵ par personne par jour', 'decimal', NULL, NULL, 'Ѵ/jour', NULL),
('pas_retroactivite', 'true', 'immuable', 'Pas d''emission retroactive', 'boolean', NULL, NULL, NULL, NULL),
('confidentialite_transactions', 'true', 'immuable', 'Confidentialite garantie des transactions', 'boolean', NULL, NULL, NULL, NULL),
('un_humain_un_compte', 'true', 'immuable', '1 etre humain = 1 compte', 'boolean', NULL, NULL, NULL, NULL),
('monnaie_indestructible', 'true', 'immuable', 'Les Ѵ ne peuvent pas etre detruits', 'boolean', NULL, NULL, NULL, NULL),
-- Gouvernance
('duree_vote_standard', '7', 'gouvernance', 'Duree des votes standards en jours', 'integer', '3', '30', 'jours', 50.00),
('duree_vote_constitutionnel', '14', 'gouvernance', 'Duree des votes constitutionnels en jours', 'integer', '7', '60', 'jours', 67.00),
('duree_vote_urgent', '3', 'gouvernance', 'Duree des votes urgents en jours', 'integer', '1', '7', 'jours', 50.00),
('quorum_standard', '50', 'gouvernance', 'Quorum pour les votes standards', 'decimal', '20', '80', '%', 50.00),
('quorum_constitutionnel', '67', 'gouvernance', 'Quorum pour les votes constitutionnels', 'decimal', '50', '90', '%', 67.00),
('seuil_adoption_standard', '50', 'gouvernance', 'Seuil d''adoption pour votes standards', 'decimal', '50', '80', '%', 50.00),
('seuil_adoption_constitutionnel', '67', 'gouvernance', 'Seuil d''adoption pour votes constitutionnels', 'decimal', '60', '90', '%', 67.00),
('duree_mandat_delegue', '365', 'gouvernance', 'Duree d''un mandat de delegue en jours', 'integer', '90', '730', 'jours', 50.00),
('max_delegations', '100', 'gouvernance', 'Nombre max de delegations recues par une personne', 'integer', '10', '1000', 'personnes', 50.00),
('parrainages_requis', '3', 'gouvernance', 'Nombre de parrainages pour la verification', 'integer', '2', '5', 'parrains', 50.00),
('max_parrainages_par_an', '10', 'gouvernance', 'Nombre max de parrainages par citoyen par an', 'integer', '5', '50', 'parrainages/an', 50.00),
('seuil_doleance', '100', 'gouvernance', 'Soutiens requis pour convertir une doleance en proposition', 'integer', '10', '1000', 'soutiens', 50.00),
('duree_discussion', '2', 'gouvernance', 'Duree minimale de discussion avant vote en jours', 'integer', '1', '14', 'jours', 50.00),
-- Technique
('contribution_pot_commun', '5', 'technique', 'Pourcentage de contribution au pot commun', 'decimal', '0', '20', '%', NULL),
('max_upload_photo', '5', 'technique', 'Taille max de la photo de profil en MB', 'integer', '1', '20', 'MB', NULL),
('session_expiry_hours', '24', 'technique', 'Duree de session en heures', 'integer', '1', '168', 'heures', NULL),
('taux_tentatives_connexion', '5', 'technique', 'Max tentatives de connexion avant blocage', 'integer', '3', '10', 'tentatives', NULL),
('duree_blocage_connexion', '15', 'technique', 'Duree de blocage apres tentatives echouees en minutes', 'integer', '5', '60', 'minutes', NULL),
('duree_verification', '365', 'technique', 'Duree de validite de la verification en jours', 'integer', '180', '730', 'jours', NULL)
ON CONFLICT (nom) DO NOTHING;
