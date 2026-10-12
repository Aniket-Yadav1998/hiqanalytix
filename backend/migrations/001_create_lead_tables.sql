CREATE TABLE IF NOT EXISTS contact_leads (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    telephone VARCHAR(32),
    company VARCHAR(160) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_leads_created_at_idx
    ON contact_leads (created_at DESC);

CREATE TABLE IF NOT EXISTS roi_leads (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    company VARCHAR(160) NOT NULL,
    industry VARCHAR(40) NOT NULL,
    current_manpower INTEGER NOT NULL CHECK (current_manpower >= 1),
    current_hours_per_week INTEGER NOT NULL CHECK (current_hours_per_week >= 1),
    current_tools VARCHAR(400) NOT NULL,
    money_savings_pct INTEGER NOT NULL,
    manpower_reduction_pct INTEGER NOT NULL,
    time_reduction_pct INTEGER NOT NULL,
    projected_manpower DOUBLE PRECISION NOT NULL,
    projected_hours_per_week DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roi_leads_created_at_idx
    ON roi_leads (created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
