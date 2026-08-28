import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteContentRow: vi.fn(async () => {}),
	getIdentityRow: vi.fn(async () => null),
	getIdentityRows: vi.fn(async () => []),
	upsertIdentityRow: vi.fn(async () => {}),
	createId: vi.fn(() => "identity-id"),
}));

vi.mock("@/repositories/contentRepository", () => ({
	default: {
		deleteContentRow: mocks.deleteContentRow,
		getIdentityRow: mocks.getIdentityRow,
		getIdentityRows: mocks.getIdentityRows,
		upsertIdentityRow: mocks.upsertIdentityRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import identityService from "@/services/identityService";

const database = {} as any;

describe("identityService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("maps hasAttachment values", async () => {
		mocks.getIdentityRows.mockResolvedValueOnce([
			{ id: "i1", title: "A", hasAttachment: 1 },
		]);
		mocks.getIdentityRow.mockResolvedValueOnce({
			id: "i2",
			title: "B",
			hasAttachment: 0,
		});
		mocks.getIdentityRow.mockResolvedValueOnce(null);

		expect(
			(await identityService.getIdentities(database))[0]?.hasAttachment,
		).toBe(true);
		expect(
			(await identityService.getIdentity(database, "i2"))?.hasAttachment,
		).toBe(false);
		expect(
			await identityService.getIdentity(database, "missing"),
		).toBeNull();
	});

	it("validates and creates identity", async () => {
		await expect(
			identityService.saveIdentity(database, {
				title: "   ",
				idNumber: "x",
				notes: "y",
			}),
		).rejects.toMatchObject<AppError>({ code: "IDENTITY_TITLE_REQUIRED" });

		const id = await identityService.saveIdentity(database, {
			title: "  Passport  ",
			idNumber: "  P123  ",
			notes: "  keep safe  ",
		});
		expect(id).toBe("identity-id");
		expect(mocks.upsertIdentityRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "identity-id",
				title: "Passport",
				idNumber: "P123",
				notes: "keep safe",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				hasAttachment: false,
			}),
		);
	});

	it("updates identity preserving createdAt and hasAttachment", async () => {
		mocks.getIdentityRow.mockResolvedValueOnce({
			id: "i1",
			createdAt: 123,
			hasAttachment: true,
		});

		const id = await identityService.saveIdentity(database, {
			id: "i1",
			title: "  Aadhaar  ",
			idNumber: "  A123  ",
			notes: "  note  ",
		});
		expect(id).toBe("i1");
		expect(mocks.upsertIdentityRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "i1",
				createdAt: 123,
				hasAttachment: true,
			}),
		);
	});

	it("deletes via content repository", async () => {
		await identityService.deleteIdentity(database, "i1");
		expect(mocks.deleteContentRow).toHaveBeenCalledWith(
			database,
			"identities",
			"IDENTITY",
			"i1",
		);
	});
});
