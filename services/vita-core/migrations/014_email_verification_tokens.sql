-- VITA Platform — Email Verification Tokens
-- Stores tokens sent via email to verify user email addresses.

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_verification_tokens(user_id);

-- Existing users: mark as verified (dev safety)
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;
