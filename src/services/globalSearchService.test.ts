import globalSearchService from "@/services/globalSearchService";

import { describe, expect, it } from "vitest";

import type Budget from "@/types/Budget";
import type CardEntry from "@/types/CardEntry";
import type Category from "@/types/Category";
import type ExchangeRate from "@/types/ExchangeRate";
import type GlobalSearchResult from "@/types/GlobalSearchResult";
import type IdentityEntry from "@/types/IdentityEntry";
import type Investment from "@/types/Investment";
import type Note from "@/types/Note";
import type PasswordEntry from "@/types/PasswordEntry";
import type Source from "@/types/Source";
import type Todo from "@/types/Todo";
import type Transaction from "@/types/Transaction";
import type Trip from "@/types/Trip";

const {
	buildFinanceResults,
	buildToolsResults,
	buildVaultResults,
	filterSearchResults,
	getKindLabel,
	getModeLabel,
	MINIMUM_SEARCH_LENGTH,
} = globalSearchService;

const NOW = 1_780_000_000_000;

const createTransaction = (
	overrides: Partial<Transaction> = {},
): Transaction => ({
	id: "txn-1",
	classification: "GENERAL",
	type: "DEBIT",
	sourceId: "source-1",
	destinationSourceId: null,
	amount: "500",
	toAmount: null,
	categoryId: "category-1",
	tripId: null,
	investmentId: null,
	reason: "Lunch",
	transactionAt: NOW,
	createdAt: NOW,
	updatedAt: NOW,
	sourceName: "Bank",
	sourceCurrencyCode: "INR",
	destinationSourceName: null,
	destinationCurrencyCode: null,
	categoryName: "Food",
	tripName: null,
	investmentName: null,
	hasAttachment: false,
	...overrides,
});

describe("getKindLabel", () => {
	it("title-cases a single-word kind", () => {
		expect(getKindLabel("NOTE")).toBe("Note");
	});

	it("splits and title-cases a snake_case kind", () => {
		expect(getKindLabel("EXCHANGE_RATE")).toBe("Exchange Rate");
	});
});

describe("getModeLabel", () => {
	it("title-cases each home mode", () => {
		expect(getModeLabel("TOOLS")).toBe("Tools");
		expect(getModeLabel("FINANCE")).toBe("Finance");
		expect(getModeLabel("VAULT")).toBe("Vault");
	});
});

describe("buildToolsResults", () => {
	const note: Note = {
		id: "note-1",
		folderId: null,
		folderName: "Ideas",
		title: "Grocery list",
		content: "Milk",
		createdAt: NOW,
		updatedAt: NOW,
		hasAttachment: false,
	};
	const todo: Todo = {
		id: "todo-1",
		folderId: null,
		folderName: null,
		title: "Ship feature",
		description: "",
		isDone: false,
		dueAt: null,
		createdAt: NOW,
		updatedAt: NOW,
		hasAttachment: false,
	};

	it("maps a note to a NOTE result using its folder name as subtitle", () => {
		const [result] = buildToolsResults([note], []);
		expect(result).toMatchObject({
			id: "note-1",
			kind: "NOTE",
			title: "Grocery list",
			subtitle: "Ideas",
		});
	});

	it("falls back to 'Note' when the note has no folder", () => {
		const [result] = buildToolsResults([{ ...note, folderName: null }], []);
		expect(result?.subtitle).toBe("Note");
	});

	it("maps a todo to a TODO result, falling back to 'Todo' with no folder", () => {
		const [result] = buildToolsResults([], [todo]);
		expect(result).toMatchObject({
			id: "todo-1",
			kind: "TODO",
			title: "Ship feature",
			subtitle: "Todo",
		});
	});

	it("places notes before todos", () => {
		const results = buildToolsResults([note], [todo]);
		expect(results.map((result) => result.kind)).toEqual(["NOTE", "TODO"]);
	});
});

describe("buildFinanceResults", () => {
	const emptyArgs = [[], [], [], [], [], [], []] as const;

	it("maps a transaction using its display reason and joined subtitle", () => {
		const [result] = buildFinanceResults(
			[createTransaction()],
			[],
			[],
			[],
			[],
			[],
			[],
		);

		expect(result?.kind).toBe("TRANSACTION");
		expect(result?.title).toBe("Lunch");
		expect(result?.subtitle).toContain("Bank");
		expect(result?.subtitle).toContain("₹500.00");
		// The category name is not part of the visible subtitle, only the
		// searchable "extra" text (covered by a dedicated test below).
		expect(result?.subtitle).not.toContain("Food");
	});

	it("falls back to the source-pair label when a transfer has no reason", () => {
		const transfer = createTransaction({
			type: "TRANSFER",
			reason: "",
			categoryId: null,
			categoryName: null,
			destinationSourceId: "source-2",
			destinationSourceName: "Cash",
			toAmount: "500",
		});
		const [result] = buildFinanceResults(
			[transfer],
			[],
			[],
			[],
			[],
			[],
			[],
		);

		expect(result?.title).toBe("Bank to Cash");
	});

	it("includes categoryName/tripName/investmentName in searchExtra for matching", () => {
		const [result] = buildFinanceResults(
			[
				createTransaction({
					tripName: "Goa",
					investmentName: null,
				}),
			],
			[],
			[],
			[],
			[],
			[],
			[],
		);

		expect(result?.searchExtra).toContain("Food");
		expect(result?.searchExtra).toContain("Goa");
	});

	it("maps a source with its currency code", () => {
		const source: Source = {
			id: "source-1",
			name: "Wallet",
			currencyCode: "USD",
			validatedAt: null,
			createdAt: NOW,
			updatedAt: NOW,
			latestTransactionCreatedAt: null,
			balance: "0",
			archived: false,
		};
		const [result] = buildFinanceResults([], [source], [], [], [], [], []);
		expect(result).toMatchObject({
			kind: "SOURCE",
			title: "Wallet",
			subtitle: "Source · USD",
		});
	});

	it("labels income vs expense categories", () => {
		const income: Category = {
			id: "c1",
			name: "Salary",
			isIncome: true,
			createdAt: NOW,
			updatedAt: NOW,
			archived: false,
		};
		const expense: Category = {
			id: "c2",
			name: "Rent",
			isIncome: false,
			createdAt: NOW,
			updatedAt: NOW,
			archived: false,
		};
		const results = buildFinanceResults(
			[],
			[],
			[income, expense],
			[],
			[],
			[],
			[],
		);
		expect(results[0]?.subtitle).toBe("Income category");
		expect(results[1]?.subtitle).toBe("Expense category");
	});

	it("maps trips and investments with static subtitles", () => {
		const trip: Trip = {
			id: "t1",
			name: "Goa",
			createdAt: NOW,
			updatedAt: NOW,
			archived: false,
		};
		const investment: Investment = {
			id: "i1",
			name: "Index Fund",
			createdAt: NOW,
			updatedAt: NOW,
			archived: false,
		};
		const results = buildFinanceResults(
			[],
			[],
			[],
			[trip],
			[investment],
			[],
			[],
		);
		expect(results[0]).toMatchObject({ kind: "TRIP", subtitle: "Trip" });
		expect(results[1]).toMatchObject({
			kind: "INVESTMENT",
			subtitle: "Investment",
		});
	});

	it("labels monthly vs yearly budgets and includes amount in searchExtra", () => {
		const monthly: Budget = {
			id: "b1",
			categoryId: "c1",
			categoryName: "Rent",
			amount: "20000",
			period: "MONTHLY",
			createdAt: NOW,
			updatedAt: NOW,
		};
		const yearly: Budget = {
			...monthly,
			id: "b2",
			period: "YEARLY",
			amount: "240000",
		};
		const results = buildFinanceResults(
			[],
			[],
			[],
			[],
			[],
			[monthly, yearly],
			[],
		);
		expect(results[0]?.subtitle).toContain("Monthly");
		expect(results[1]?.subtitle).toContain("Yearly");
		expect(results[0]?.searchExtra).toBe("MONTHLY 20000");
	});

	it("maps exchange rates with source and rate in searchExtra", () => {
		const rate: ExchangeRate = {
			currencyCode: "USD",
			rateToInr: "83.5",
			source: "API",
			fetchedAt: NOW,
			updatedAt: NOW,
		};
		const [result] = buildFinanceResults([], [], [], [], [], [], [rate]);
		expect(result).toMatchObject({
			kind: "EXCHANGE_RATE",
			title: "USD",
			searchExtra: "API 83.5",
		});
	});

	it("returns an empty array when every finance list is empty", () => {
		expect(buildFinanceResults(...emptyArgs)).toEqual([]);
	});
});

describe("buildVaultResults", () => {
	it("prefers username, falling back to website for password subtitles", () => {
		const withUsername: PasswordEntry = {
			id: "p1",
			title: "Bank",
			username: "alice",
			password: "secret",
			website: "bank.com",
			notes: "",
			createdAt: NOW,
			updatedAt: NOW,
		};
		const withoutUsername: PasswordEntry = {
			...withUsername,
			id: "p2",
			username: "",
		};
		const results = buildVaultResults(
			[withUsername, withoutUsername],
			[],
			[],
		);
		expect(results[0]?.subtitle).toBe("alice");
		expect(results[1]?.subtitle).toBe("bank.com");
	});

	it("prefers network, falling back to 'Card' for card subtitles", () => {
		const card: CardEntry = {
			id: "card-1",
			name: "Visa",
			cardType: "CREDIT_CARD",
			cardNumber: "[REDACTED_CREDIT_CARD_NUMBER_1]",
			expiry: "",
			cvv: "",
			pin: "",
			network: "",
			notes: "",
			createdAt: NOW,
			updatedAt: NOW,
			hasAttachment: false,
		};
		const results = buildVaultResults(
			[],
			[card, { ...card, id: "card-2", network: "Visa" }],
			[],
		);
		expect(results[0]?.subtitle).toBe("Card");
		expect(results[1]?.subtitle).toBe("Visa");
	});

	it("prefers idNumber, falling back to 'Identity' for identity subtitles", () => {
		const identity: IdentityEntry = {
			id: "identity-1",
			title: "Passport",
			idNumber: "",
			notes: "",
			createdAt: NOW,
			updatedAt: NOW,
			hasAttachment: false,
		};
		const results = buildVaultResults(
			[],
			[],
			[identity, { ...identity, id: "identity-2", idNumber: "X123" }],
		);
		expect(results[0]?.subtitle).toBe("Identity");
		expect(results[1]?.subtitle).toBe("X123");
	});
});

describe("filterSearchResults", () => {
	const results: readonly GlobalSearchResult[] = [
		{
			id: "1",
			kind: "NOTE",
			title: "Grocery list",
			subtitle: "Ideas folder",
			icon: "document-text-outline",
			color: "#000",
		},
		{
			id: "2",
			kind: "EXCHANGE_RATE",
			title: "USD",
			subtitle: "Exchange rate · $83.50",
			icon: "earth-outline",
			color: "#000",
			searchExtra: "API 83.5",
		},
	];

	it("returns nothing below the minimum search length", () => {
		expect(filterSearchResults(results, "a")).toEqual([]);
		expect(MINIMUM_SEARCH_LENGTH).toBe(2);
	});

	it("matches case-insensitively against the title", () => {
		expect(filterSearchResults(results, "GROCERY")).toHaveLength(1);
	});

	it("matches against the subtitle", () => {
		expect(filterSearchResults(results, "ideas")).toHaveLength(1);
	});

	it("matches against the human-readable kind label", () => {
		expect(filterSearchResults(results, "exchange rate")).toHaveLength(1);
	});

	it("matches against hidden searchExtra content", () => {
		expect(filterSearchResults(results, "83.5")).toHaveLength(1);
	});

	it("trims whitespace before checking the minimum length", () => {
		expect(filterSearchResults(results, "  g  ")).toEqual([]);
	});

	it("returns an empty array when nothing matches", () => {
		expect(filterSearchResults(results, "nonexistent")).toEqual([]);
	});
});
