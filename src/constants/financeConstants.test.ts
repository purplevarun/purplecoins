import financeConstants from "@/constants/financeConstants";

import { describe, expect, it } from "vitest";

const {
	ANALYSIS_PERIODS,
	ATTACHMENT_OWNER_TYPES,
	BUDGET_PERIODS,
	RATE_SOURCES,
	RELATION_KINDS,
	TRANSACTION_CLASSIFICATIONS,
	TRANSACTION_TYPES,
	VAULT_KINDS,
} = financeConstants;

// These arrays back nearly every discriminated union / SQL CHECK constraint
// in the app (transaction classification & type, relation kinds, vault
// kinds, etc). Pinning their exact contents guards against an accidental
// edit silently breaking the schema/type relationship they maintain.
describe("financeConstants", () => {
	it("defines the transaction classifications", () => {
		expect(TRANSACTION_CLASSIFICATIONS).toEqual(["GENERAL", "INVESTMENT"]);
	});

	it("defines the transaction types", () => {
		expect(TRANSACTION_TYPES).toEqual(["DEBIT", "CREDIT", "TRANSFER"]);
	});

	it("defines the budget periods", () => {
		expect(BUDGET_PERIODS).toEqual(["MONTHLY", "YEARLY"]);
	});

	it("defines the analysis periods", () => {
		expect(ANALYSIS_PERIODS).toEqual([
			"MONTH",
			"YEAR",
			"ALL",
			"CUSTOM",
			"FY",
			"YTD",
		]);
	});

	it("defines the relation kinds", () => {
		expect(RELATION_KINDS).toEqual([
			"SOURCE",
			"CATEGORY",
			"TRIP",
			"INVESTMENT",
		]);
	});

	it("defines the vault kinds", () => {
		expect(VAULT_KINDS).toEqual(["PASSWORD", "CARD", "IDENTITY"]);
	});

	it("defines the attachment owner types", () => {
		expect(ATTACHMENT_OWNER_TYPES).toEqual([
			"TRANSACTION",
			"NOTE",
			"TODO",
			"CARD",
			"IDENTITY",
		]);
	});

	it("defines the exchange-rate sources", () => {
		expect(RATE_SOURCES).toEqual(["API", "MANUAL"]);
	});
});
