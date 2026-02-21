-- VITA Platform — Web of Trust Enhancements
--
-- Renforce le systeme de parrainage avec :
--   - Cooldown de 30 jours entre deux attestations par un meme parrain
--   - Support de revocation (un parrain peut revoquer son attestation)
--   - Detection anti-parrainage croise (A parraine B, B ne peut pas parrainer A)
--   - Expiration des demandes a 14 jours (au lieu de 30)

-- ── 1. Ajout du suivi de cooldown par parrain ────────────────────────
-- Stocke la date de la derniere attestation pour imposer le delai de 30j.

ALTER TABLE parrainages
    ADD COLUMN IF NOT EXISTS date_derniere_attestation TIMESTAMPTZ;

-- Mettre a jour les parrainages existants deja acceptes
UPDATE parrainages
    SET date_derniere_attestation = date_reponse
    WHERE statut = 'accepte' AND date_reponse IS NOT NULL;

-- ── 2. Support de revocation ──────────────────────────────────────────
-- Ajoute le statut 'revoque' et les champs de revocation.

ALTER TABLE parrainages
    DROP CONSTRAINT IF EXISTS parrainages_statut_check;

ALTER TABLE parrainages
    ADD CONSTRAINT parrainages_statut_check
    CHECK (statut IN ('invite', 'en_attente', 'accepte', 'refuse', 'expire', 'revoque'));

ALTER TABLE parrainages
    ADD COLUMN IF NOT EXISTS date_revocation TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS motif_revocation TEXT;

-- ── 3. Index pour detection anti-parrainage croise ───────────────────
-- Permet de verifier rapidement si B a parraine A avant que A parraine B.

CREATE INDEX IF NOT EXISTS idx_parrainages_cross_check
    ON parrainages (parrain_id, demande_id)
    WHERE statut IN ('accepte', 'invite', 'en_attente');

-- ── 4. Index pour cooldown : derniere attestation par parrain ─────────

CREATE INDEX IF NOT EXISTS idx_parrainages_cooldown
    ON parrainages (parrain_id, date_reponse DESC)
    WHERE statut = 'accepte';

-- ── 5. Index pour revocations actives ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_parrainages_revoque
    ON parrainages (parrain_id)
    WHERE statut = 'revoque';

-- ── 6. Parametre systeme : cooldown en jours ─────────────────────────

INSERT INTO parametres_systeme (nom, valeur, description, categorie, modifiable_par_vote)
VALUES (
    'cooldown_parrainage_jours',
    '30',
    'Nombre de jours minimum entre deux attestations par un meme parrain',
    'identite',
    true
)
ON CONFLICT (nom) DO NOTHING;

-- ── 7. Parametre systeme : duree expiration demande ──────────────────

INSERT INTO parametres_systeme (nom, valeur, description, categorie, modifiable_par_vote)
VALUES (
    'duree_demande_verification_jours',
    '14',
    'Nombre de jours avant expiration d''une demande de verification',
    'identite',
    true
)
ON CONFLICT (nom) DO NOTHING;
