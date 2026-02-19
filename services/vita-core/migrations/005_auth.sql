-- VITA Platform — Authentication & User Identity
-- Users table is the main identity + auth table.
-- The existing accounts table keeps financial data (balance, keys).

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,

    -- Legal identity (private)
    prenom_legal VARCHAR(100) NOT NULL,
    nom_legal VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    nationalite VARCHAR(100),
    pays_residence VARCHAR(100),

    -- Public identity
    username VARCHAR(50) UNIQUE NOT NULL,
    mode_visibilite VARCHAR(20) DEFAULT 'complet' CHECK (mode_visibilite IN ('complet', 'pseudonyme', 'anonyme')),
    prenom_affiche VARCHAR(100),
    nom_affiche VARCHAR(100),
    pseudonyme VARCHAR(50),
    bio TEXT,
    photo_profil TEXT,
    pays_affiche VARCHAR(100),

    -- Role and status
    role VARCHAR(30) DEFAULT 'nouveau' CHECK (role IN (
        'dieu', 'super_admin', 'admin', 'moderateur', 'auditeur',
        'delegue', 'citoyen', 'nouveau', 'observateur', 'suspendu'
    )),

    -- Identity verification
    verification_statut VARCHAR(20) DEFAULT 'non_verifie' CHECK (verification_statut IN (
        'non_verifie', 'en_cours', 'verifie', 'expire', 'rejete'
    )),
    verification_date TIMESTAMPTZ,
    verification_expiration TIMESTAMPTZ,
    niveau_confiance INTEGER DEFAULT 0,

    -- Metadata
    date_inscription TIMESTAMPTZ DEFAULT NOW(),
    derniere_connexion TIMESTAMPTZ,
    actif BOOLEAN DEFAULT TRUE,
    suspendu_jusqua TIMESTAMPTZ,
    motif_suspension TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Link accounts (wallets) to users
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Sessions table for JWT refresh token tracking
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
