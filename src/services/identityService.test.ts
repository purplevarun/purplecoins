import identityService from "@/services/identityService";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteIdentity, getIdentities, getIdentity, saveIdentity } =
	identityService;

describe("identityService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveIdentity (create)", () => {
		it("creates an identity entry with trimmed fields", async () => {
			const id = await saveIdentity(database, {
				title: "  Passport  ",
				idNumber: "  X1234567  ",
				notes: "  note  ",
			});

			const identity = await getIdentity(database, id);
			expect(identity?.title).toBe("Passport");
			expect(identity?.idNumber).toBe("X1234567");
			expect(identity?.notes).toBe("note");
			expect(identity?.hasAttachment).toBe(false);
		});

		it("throws IDENTITY_TITLE_REQUIRED for a blank title", async () => {
			await expect(
				saveIdentity(database, {
					title: "   ",
					idNumber: "",
					notes: "",
				}),
			).rejects.toMatchObject({ code: "IDENTITY_TITLE_REQUIRED" });
		});
	});

	describe("saveIdentity (update)", () => {
		it("preserves createdAt and hasAttachment when updating", async () => {
			const id = await saveIdentity(database, {
				title: "Old",
				idNumber: "",
				notes: "",
			});
			const original = await getIdentity(database, id);

			await saveIdentity(database, {
				id,
				title: "New",
				idNumber: "",
				notes: "",
			});

			const updated = await getIdentity(database, id);
			expect(updated?.title).toBe("New");
			expect(updated?.createdAt).toBe(original?.createdAt);
		});
	});

	describe("getIdentities / deleteIdentity", () => {
		it("lists all identities", async () => {
			await saveIdentity(database, {
				title: "A",
				idNumber: "",
				notes: "",
			});
			expect(await getIdentities(database)).toHaveLength(1);
		});

		it("returns null for a missing identity", async () => {
			expect(await getIdentity(database, "missing")).toBeNull();
		});

		it("deletes an identity", async () => {
			const id = await saveIdentity(database, {
				title: "A",
				idNumber: "",
				notes: "",
			});

			await deleteIdentity(database, id);

			expect(await getIdentity(database, id)).toBeNull();
		});
	});
});
