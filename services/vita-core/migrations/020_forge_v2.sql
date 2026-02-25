-- VITA Platform — Forge v2: Git-like collaborative editing schema
-- Replaces the flat Document/Diff model with Projects > Branches > Commits > Merge Requests

-- Drop old forge tables
DROP TABLE IF EXISTS forge_diff_votes CASCADE;
DROP TABLE IF EXISTS forge_document_history CASCADE;
DROP TABLE IF EXISTS forge_diffs CASCADE;
DROP TABLE IF EXISTS forge_documents CASCADE;

-- 1. Projects — wraps a Codex article or standalone text
CREATE TABLE IF NOT EXISTS forge_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    codex_ref       INTEGER,  -- nullable FK to codex_articles.number
    default_branch  UUID,     -- set after branch creation
    created_by      UUID NOT NULL REFERENCES accounts(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_projects_codex ON forge_projects(codex_ref);
CREATE INDEX IF NOT EXISTS idx_forge_projects_created_by ON forge_projects(created_by);

-- 2. Branches — named branches per project
CREATE TABLE IF NOT EXISTS forge_branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES forge_projects(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    head_commit_id  UUID,     -- nullable, set after first commit
    created_by      UUID NOT NULL REFERENCES accounts(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_forge_branches_project ON forge_branches(project_id);

-- Now add FK for default_branch
ALTER TABLE forge_projects
    ADD CONSTRAINT fk_forge_projects_default_branch
    FOREIGN KEY (default_branch) REFERENCES forge_branches(id) ON DELETE SET NULL;

-- 3. Commits — content snapshots on a branch
CREATE TABLE IF NOT EXISTS forge_commits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES forge_branches(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES accounts(id),
    message         TEXT NOT NULL,
    content         TEXT NOT NULL,
    parent_id       UUID REFERENCES forge_commits(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_commits_branch ON forge_commits(branch_id);
CREATE INDEX IF NOT EXISTS idx_forge_commits_author ON forge_commits(author_id);

-- Now add FK for head_commit_id
ALTER TABLE forge_branches
    ADD CONSTRAINT fk_forge_branches_head_commit
    FOREIGN KEY (head_commit_id) REFERENCES forge_commits(id) ON DELETE SET NULL;

-- 4. Merge Requests — proposals from source_branch to target_branch
CREATE TABLE IF NOT EXISTS forge_merge_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES forge_projects(id) ON DELETE CASCADE,
    source_branch_id    UUID NOT NULL REFERENCES forge_branches(id) ON DELETE CASCADE,
    target_branch_id    UUID NOT NULL REFERENCES forge_branches(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    author_id           UUID NOT NULL REFERENCES accounts(id),
    status              TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'voting', 'approved', 'merged', 'rejected')),
    votes_for           INTEGER NOT NULL DEFAULT 0,
    votes_against       INTEGER NOT NULL DEFAULT 0,
    merged_by           UUID REFERENCES accounts(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_mr_project ON forge_merge_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_forge_mr_status ON forge_merge_requests(status);
CREATE INDEX IF NOT EXISTS idx_forge_mr_author ON forge_merge_requests(author_id);

-- 5. MR Votes
CREATE TABLE IF NOT EXISTS forge_mr_votes (
    merge_request_id    UUID NOT NULL REFERENCES forge_merge_requests(id) ON DELETE CASCADE,
    account_id          UUID NOT NULL REFERENCES accounts(id),
    choice              TEXT NOT NULL CHECK (choice IN ('for', 'against')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (merge_request_id, account_id)
);

-- 6. MR Comments
CREATE TABLE IF NOT EXISTS forge_mr_comments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merge_request_id    UUID NOT NULL REFERENCES forge_merge_requests(id) ON DELETE CASCADE,
    author_id           UUID NOT NULL REFERENCES accounts(id),
    content             TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_mr_comments_mr ON forge_mr_comments(merge_request_id);

-- 7. Contributors view — aggregated stats per project
CREATE OR REPLACE VIEW forge_contributors AS
SELECT
    c.author_id,
    b.project_id,
    a.display_name,
    COUNT(DISTINCT c.id) AS commit_count,
    COUNT(DISTINCT mr.id) AS mr_count,
    MAX(c.created_at) AS last_active
FROM forge_commits c
JOIN forge_branches b ON b.id = c.branch_id
JOIN accounts a ON a.id = c.author_id
LEFT JOIN forge_merge_requests mr
    ON mr.author_id = c.author_id AND mr.project_id = b.project_id
GROUP BY c.author_id, b.project_id, a.display_name;

-- ── Data migration: seed forge_projects from non-immutable codex articles ──

DO $$
DECLARE
    art RECORD;
    proj_id UUID;
    branch_id UUID;
    commit_id UUID;
    admin_id UUID;
BEGIN
    -- Find the first admin account to use as creator (role is on users table)
    SELECT a.id INTO admin_id
    FROM accounts a
    JOIN users u ON u.id = a.user_id
    WHERE u.role IN ('dieu', 'super_admin', 'admin')
    LIMIT 1;

    -- Fallback: use any account
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM accounts LIMIT 1;
    END IF;

    -- Skip seeding if no accounts exist
    IF admin_id IS NULL THEN
        RETURN;
    END IF;

    FOR art IN
        SELECT number, name, content
        FROM codex_articles
        WHERE immutable = FALSE
    LOOP
        -- Create project
        proj_id := gen_random_uuid();
        INSERT INTO forge_projects (id, title, description, codex_ref, created_by)
        VALUES (proj_id, 'Article ' || art.number || ' — ' || art.name, 'Projet lie a l''article ' || art.number || ' du Codex', art.number, admin_id);

        -- Create default branch
        branch_id := gen_random_uuid();
        INSERT INTO forge_branches (id, project_id, name, is_default, created_by)
        VALUES (branch_id, proj_id, 'main', TRUE, admin_id);

        -- Create initial commit
        commit_id := gen_random_uuid();
        INSERT INTO forge_commits (id, branch_id, author_id, message, content)
        VALUES (commit_id, branch_id, admin_id, 'Contenu initial de l''article ' || art.number, art.content);

        -- Link head_commit and default_branch
        UPDATE forge_branches SET head_commit_id = commit_id WHERE id = branch_id;
        UPDATE forge_projects SET default_branch = branch_id WHERE id = proj_id;
    END LOOP;
END $$;
