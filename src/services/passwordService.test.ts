import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteContentRow: vi.fn(async () => {}),
	getPasswordRow: vi.fn(async () => null),
	getPasswordRows: vi.fn(async () => []),
	upsertPasswordRow: vi.fn(async () => {}),
	createId: vi.fn(() => "password-id"),
}));

vi.mock("@/repositories/contentRepository", () => ({
	default: {
		deleteContentRow: mocks.deleteContentRow,
		getPasswordRow: mocks.getPasswordRow,
		getPasswordRows: mocks.getPasswordRows,
		upsertPasswordRow: mocks.upsertPasswordRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import passwordService from "@/services/passwordService";

const database = {} as any;

describe("passwordService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("gets passwords and single password", async () => {
		mocks.getPasswordRows.mockResolvedValueOnce([{ id: "p1" }]);
		mocks.getPasswordRow.mockResolvedValueOnce({ id: "p2" });

		expect(await passwordService.getPasswords(database)).toEqual([{ id: "p1" }]);
		expect(await passwordService.getPassword(database, "p2")).toEqual({ id: "p2" });
	});

	it("validates required fields", async () => {
		await expect(
			passwordService.savePassword(database, {
				title: "   ",
				username: "u",
				password: "secret",
				website: "w",
				notes: "n",
			}),
		).rejects.toMatchObject<AppError>({ code: "PASSWORD_TITLE_REQUIRED" });

		await expect(
			passwordService.savePassword(database, {
				title: "Site",
				username: "u",
				password: "",
				website: "w",
				notes: "n",
			}),
		).rejects.toMatchObject<AppError>({ code: "PASSWORD_REQUIRED" });
	});

	it("creates and updates password", async () => {
		const id = await passwordService.savePassword(database, {
			title: "  Site  ",
			username: "  user  ",
			password: "secret",
			website: "  example.com ",
			notes: "  personal ",
		});
		expect(id).toBe("password-id");
		expect(mocks.upsertPasswordRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "password-id",
				title: "Site",
				username: "user",
				password: "secret",
				website: "example.com",
				notes: "personal",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);

		mocks.getPasswordRow.mockResolvedValueOnce({ id: "p1", createdAt: 123 });
		const updated = await passwordService.savePassword(database, {
			id: "p1",
			title: "  Site 2  ",
			username: "  u2 ",
			password: "new",
			website: "  test.com ",
			notes: "  work ",
		});
		expect(updated).toBe("p1");
		expect(mocks.upsertPasswordRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({ id: "p1", createdAt: 123, title: "Site 2" }),
		);
	});

	it("deletes via content repository", async () => {
		await passwordService.deletePassword(database, "p1");
		expect(mocks.deleteContentRow).toHaveBeenCalledWith(
			database,
			"passwords",
			null,
			"p1",
		);
	});
});
