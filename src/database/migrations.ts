// Idempotent ALTER TABLE statements for columns added to already-existing tables.
// CREATE TABLE IF NOT EXISTS in schema.ts only helps brand-new installs; existing
// installs need these to pick up new columns without losing data.
const SCHEMA_MIGRATIONS: readonly string[] = [
	"ALTER TABLE investments ADD COLUMN label TEXT;",
	"ALTER TABLE investments ADD COLUMN investment_type_id TEXT;",
];

export default SCHEMA_MIGRATIONS;
