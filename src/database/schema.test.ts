import SCHEMA_SQL from "@/database/schema";

import { describe, expect, it } from "vitest";

describe("schema", () => {
	it("contains core tables and constraints", () => {
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS sources");
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS transactions");
		expect(SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS attachments");
		expect(SCHEMA_SQL).toContain("CHECK (classification IN ('GENERAL', 'INVESTMENT'))");
		expect(SCHEMA_SQL).toContain("PRAGMA foreign_keys = ON;");
	});
});
