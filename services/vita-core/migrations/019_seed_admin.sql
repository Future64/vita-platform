-- VITA Platform — Seed admin account
-- Password: vita2025 (Argon2id hash)

-- Update role CHECK constraint to include new delegation-based roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (
    'dieu', 'super_admin', 'admin', 'moderateur', 'auditeur',
    'gardien', 'mandataire', 'referent',
    'delegue', 'citoyen', 'nouveau', 'observateur', 'suspendu'
));

-- Insert admin user
INSERT INTO users (
    email, email_verified, password_hash,
    prenom_legal, nom_legal, date_naissance, pays_residence,
    username, mode_visibilite, prenom_affiche, nom_affiche,
    role, verification_statut, niveau_confiance, actif
) VALUES (
    'maxim@vita.world', TRUE,
    '$argon2id$v=19$m=19456,t=2,p=1$7yVsBcED+yVX4Brbvb4u/A$ZGLeLN6WjUZxxVJZjIHO5af6e1xiHeQBF4Ey5VdsRAc',
    'Maxim', 'Dassonneville', '1990-01-01', 'France',
    'maxim', 'complet', 'Maxim', 'Dassonneville',
    'dieu', 'verifie', 100, TRUE
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    email_verified = TRUE,
    verification_statut = 'verifie',
    actif = TRUE;

-- Create wallet for admin (only if no wallet exists for this user)
INSERT INTO accounts (user_id, display_name, balance, verified, public_key)
SELECT id, 'Maxim', 100.000000, TRUE, decode(md5(id::text), 'hex')
FROM users WHERE email = 'maxim@vita.world'
  AND NOT EXISTS (SELECT 1 FROM accounts WHERE accounts.user_id = users.id);
