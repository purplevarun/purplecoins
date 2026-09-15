import SCHEMA_SQL from "@/database/schema";

import { describe, expect, it } from "vitest";

describe("schema", () => {
	it("adds an idempotent creation-time index for transaction paging", () => {
		expect(SCHEMA_SQL).toContain(
			"CREATE INDEX IF NOT EXISTS idx_transactions_created\n\tON transactions(created_at DESC, id DESC);",
		);
	});

	it("contains core tables and constraints", () => {
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS sources");
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS transactions");
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS attachments");
		expect(SCHEMA_SQL).toContain(
			"CHECK (classification IN ('GENERAL', 'INVESTMENT'))",
		);
		expect(SCHEMA_SQL).toContain("PRAGMA foreign_keys = ON;");
	});
});
