import SCHEMA_MIGRATIONS from "@/database/migrations";

import { describe, expect, it } from "vitest";

describe("migrations", () => {
	it("adds the optional investment label and type columns", () => {
		expect(SCHEMA_MIGRATIONS).toContain(
			"ALTER TABLE investments ADD COLUMN label TEXT;",
		);
		expect(SCHEMA_MIGRATIONS).toContain(
			"ALTER TABLE investments ADD COLUMN investment_type_id TEXT;",
		);
	});
});
