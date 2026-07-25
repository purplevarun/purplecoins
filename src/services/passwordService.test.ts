import passwordService from "@/services/passwordService";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { deletePassword, getPassword, getPasswords, savePassword } =
	passwordService;

describe("passwordService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("savePassword (create)", () => {
		it("creates a password entry with trimmed fields", async () => {
			const id = await savePassword(database, {
				title: "  Bank  ",
				username: "  alice  ",
				password: "secret",
				website: "  bank.com  ",
				notes: "  note  ",
			});

			const entry = await getPassword(database, id);
			expect(entry?.title).toBe("Bank");
			expect(entry?.username).toBe("alice");
			expect(entry?.website).toBe("bank.com");
			expect(entry?.notes).toBe("note");
			expect(entry?.password).toBe("secret");
		});

		it("does not trim the password itself", async () => {
			const id = await savePassword(database, {
				title: "Bank",
				username: "",
				password: "  spaced-secret  ",
				website: "",
				notes: "",
			});
			expect((await getPassword(database, id))?.password).toBe(
				"  spaced-secret  ",
			);
		});

		it("throws PASSWORD_TITLE_REQUIRED for a blank title", async () => {
			await expect(
				savePassword(database, {
					title: "   ",
					username: "",
					password: "secret",
					website: "",
					notes: "",
				}),
			).rejects.toMatchObject({ code: "PASSWORD_TITLE_REQUIRED" });
		});

		it("throws PASSWORD_REQUIRED for an empty password", async () => {
			await expect(
				savePassword(database, {
					title: "Bank",
					username: "",
					password: "",
					website: "",
					notes: "",
				}),
			).rejects.toMatchObject({ code: "PASSWORD_REQUIRED" });
		});
	});

	describe("savePassword (update)", () => {
		it("preserves createdAt when updating", async () => {
			const id = await savePassword(database, {
				title: "Bank",
				username: "",
				password: "secret",
				website: "",
				notes: "",
			});
			const original = await getPassword(database, id);

			await savePassword(database, {
				id,
				title: "New title",
				username: "",
				password: "new-secret",
				website: "",
				notes: "",
			});

			const updated = await getPassword(database, id);
			expect(updated?.title).toBe("New title");
			expect(updated?.password).toBe("new-secret");
			expect(updated?.createdAt).toBe(original?.createdAt);
		});
	});

	describe("getPasswords / deletePassword", () => {
		it("lists all password entries", async () => {
			await savePassword(database, {
				title: "A",
				username: "",
				password: "1",
				website: "",
				notes: "",
			});
			expect(await getPasswords(database)).toHaveLength(1);
		});

		it("returns null for a missing entry", async () => {
			expect(await getPassword(database, "missing")).toBeNull();
		});

		it("deletes an entry", async () => {
			const id = await savePassword(database, {
				title: "A",
				username: "",
				password: "1",
				website: "",
				notes: "",
			});

			await deletePassword(database, id);

			expect(await getPassword(database, id)).toBeNull();
		});
	});
});
