-- VITA Platform — Persistent notifications table
-- Stores notifications for users (daily VITA, vote results, transfers, etc.)

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    titre       TEXT NOT NULL,
    contenu     TEXT NOT NULL,
    lien        TEXT,
    lue         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, lue, created_at DESC);
CREATE INDEX idx_notifications_user_recent ON notifications(user_id, created_at DESC);
