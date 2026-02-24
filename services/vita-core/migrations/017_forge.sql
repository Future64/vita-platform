-- VITA Platform — Forge (collaborative editing) schema

-- Documents à éditer (articles du Codex, textes fondateurs)
CREATE TABLE IF NOT EXISTS forge_documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    content      TEXT NOT NULL,
    version      INTEGER NOT NULL DEFAULT 1,
    codex_ref    INTEGER,  -- references codex_articles.number if linked
    locked       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_documents_codex ON forge_documents(codex_ref);

-- Propositions de modification (diffs)
CREATE TABLE IF NOT EXISTS forge_diffs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id    UUID NOT NULL REFERENCES forge_documents(id) ON DELETE CASCADE,
    author_id      UUID NOT NULL REFERENCES accounts(id),
    title          TEXT NOT NULL,
    description    TEXT,
    content_new    TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
    votes_for      INTEGER NOT NULL DEFAULT 0,
    votes_against  INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at    TIMESTAMPTZ,
    reviewer_id    UUID REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_forge_diffs_document ON forge_diffs(document_id);
CREATE INDEX IF NOT EXISTS idx_forge_diffs_author ON forge_diffs(author_id);
CREATE INDEX IF NOT EXISTS idx_forge_diffs_status ON forge_diffs(status);

-- Votes on diffs
CREATE TABLE IF NOT EXISTS forge_diff_votes (
    diff_id      UUID NOT NULL REFERENCES forge_diffs(id) ON DELETE CASCADE,
    account_id   UUID NOT NULL REFERENCES accounts(id),
    choice       TEXT NOT NULL CHECK (choice IN ('for', 'against')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (diff_id, account_id)
);

-- Document version history
CREATE TABLE IF NOT EXISTS forge_document_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id  UUID NOT NULL REFERENCES forge_documents(id) ON DELETE CASCADE,
    version      INTEGER NOT NULL,
    content      TEXT NOT NULL,
    diff_id      UUID REFERENCES forge_diffs(id),
    author_id    UUID REFERENCES accounts(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_history_document ON forge_document_history(document_id);

-- Seed forge_documents from non-immutable codex articles
INSERT INTO forge_documents (title, content, codex_ref)
SELECT
    'Article ' || number || ' — ' || name,
    content,
    number
FROM codex_articles
WHERE immutable = FALSE;
