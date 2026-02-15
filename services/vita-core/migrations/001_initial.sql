-- VITA Platform — Initial Schema
-- Constitutional rule: 1 person = 1 Ѵ per day, no retroactivity, privacy guaranteed, 1 person = 1 account

-- Accounts (one per verified human)
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key      BYTEA NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified        BOOLEAN NOT NULL DEFAULT false,
    last_emission_at TIMESTAMPTZ,
    balance         DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_received  DECIMAL(20, 8) NOT NULL DEFAULT 0,
    display_name    VARCHAR(64)
);

CREATE INDEX idx_accounts_verified ON accounts (verified);
CREATE INDEX idx_accounts_created_at ON accounts (created_at);

-- Transactions
CREATE TABLE transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_type                 VARCHAR(20) NOT NULL,
    from_account_id         UUID REFERENCES accounts(id),
    to_account_id           UUID NOT NULL REFERENCES accounts(id),
    amount                  DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    common_fund_contribution DECIMAL(20, 8) NOT NULL DEFAULT 0,
    net_amount              DECIMAL(20, 8) NOT NULL,
    note                    TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_from ON transactions (from_account_id);
CREATE INDEX idx_transactions_to ON transactions (to_account_id);
CREATE INDEX idx_transactions_created_at ON transactions (created_at);
CREATE INDEX idx_transactions_tx_type ON transactions (tx_type);

-- Common fund (single row, shared pot)
CREATE TABLE common_fund (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    balance             DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_contributions DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_disbursements DECIMAL(20, 8) NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO common_fund (balance, total_contributions, total_disbursements)
VALUES (0, 0, 0);

-- Emission log (prevents double emission per day)
CREATE TABLE emission_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id    UUID NOT NULL REFERENCES accounts(id),
    emission_date DATE NOT NULL,
    amount        DECIMAL(20, 8) NOT NULL DEFAULT 1.0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, emission_date)
);
