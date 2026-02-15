-- VITA Platform — Credit Loans
-- Mutual credit at ZERO interest, guaranteed by the common fund.

CREATE TABLE credit_loans (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id           UUID NOT NULL REFERENCES accounts(id),
    amount               DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    remaining            DECIMAL(20, 8) NOT NULL CHECK (remaining >= 0),
    daily_repayment_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.25,
    status               VARCHAR(20) NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'repaid', 'defaulted')),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at         TIMESTAMPTZ
);

CREATE INDEX idx_credit_loans_account ON credit_loans (account_id);
CREATE INDEX idx_credit_loans_status ON credit_loans (status);
