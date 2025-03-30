
\c payment_gateway;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    secret VARCHAR(64) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free', -- 'free' or 'pro'
    webhook_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    order_id VARCHAR(50),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL, -- e.g., 'success', 'failed', 'pending'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL,
    webhook_url TEXT NOT NULL,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    success BOOLEAN DEFAULT FALSE,
    retry_count INTEGER DEFAULT 0,
    attempt_time TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transaction_id ON transactions (transaction_id);
CREATE INDEX idx_merchant_api_key ON merchants (api_key);
CREATE INDEX idx_transaction_merchant_id ON transactions (merchant_id);