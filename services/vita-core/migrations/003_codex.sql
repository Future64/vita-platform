-- VITA Platform — Codex (Constitution) schema

-- Titles (chapters of the Constitution)
CREATE TABLE codex_titles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number        VARCHAR(10) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    display_order INTEGER NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles (individual constitutional articles)
CREATE TABLE codex_articles (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_id   UUID NOT NULL REFERENCES codex_titles(id),
    number     INTEGER NOT NULL UNIQUE,
    name       VARCHAR(200) NOT NULL,
    content    TEXT NOT NULL,
    rationale  TEXT,
    immutable  BOOLEAN NOT NULL DEFAULT false,
    status     VARCHAR(20) NOT NULL DEFAULT 'active',
    version    INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_codex_articles_title ON codex_articles (title_id);
CREATE INDEX idx_codex_articles_status ON codex_articles (status);

-- Version history for articles
CREATE TABLE codex_versions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id     UUID NOT NULL REFERENCES codex_articles(id),
    version        INTEGER NOT NULL,
    content        TEXT NOT NULL,
    rationale      TEXT,
    change_summary TEXT,
    author_id      UUID REFERENCES accounts(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id, version)
);

-- Amendment proposals
CREATE TABLE codex_amendments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id         UUID NOT NULL REFERENCES codex_articles(id),
    proposed_content   TEXT NOT NULL,
    proposed_rationale TEXT,
    change_summary     TEXT NOT NULL,
    author_id          UUID NOT NULL REFERENCES accounts(id),
    status             VARCHAR(20) NOT NULL DEFAULT 'draft',
    co_signatures      INTEGER NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deliberation_end   TIMESTAMPTZ,
    voting_end         TIMESTAMPTZ
);

CREATE INDEX idx_codex_amendments_article ON codex_amendments (article_id);
CREATE INDEX idx_codex_amendments_status ON codex_amendments (status);
