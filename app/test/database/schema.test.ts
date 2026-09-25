import SCHEMA_SQL from "@/database/schema";

import { describe, expect, it } from "vitest";

describe("schema", () => {
	it("adds an idempotent creation-time index for transaction paging", () => {
		expect(SCHEMA_SQL).toContain(
			"CREATE INDEX IF NOT EXISTS idx_transactions_created\n\tON transactions(created_at DESC, id DESC);",
		);
	});

	it("contains core tables without database constraints", () => {
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS sources");
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS transactions");
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS attachments");
		expect(SCHEMA_SQL).not.toMatch(
			/\b(CHECK|FOREIGN KEY|REFERENCES|PRIMARY KEY|UNIQUE|NOT NULL)\b/,
		);
		expect(SCHEMA_SQL).not.toContain("PRAGMA");
	});
});
