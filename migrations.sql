-- Manual migration SQL for older PurpleCoins databases.
-- Run this in the SQLite console against your legacy .purplecoins file before opening it in the app.
--
-- This adds the newer investment metadata columns and table required by the current schema.

BEGIN;

CREATE TABLE IF NOT EXISTS investment_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

ALTER TABLE investments ADD COLUMN label TEXT;
ALTER TABLE investments ADD COLUMN investment_type_id TEXT;

CREATE INDEX IF NOT EXISTS idx_investments_type
    ON investments(investment_type_id);

COMMIT;
