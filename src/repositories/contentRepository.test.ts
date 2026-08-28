import contentRepository from "@/repositories/contentRepository";

import { describe, expect, it, vi } from "vitest";

const {
	deleteContentRow,
	deleteFolderRow,
	getCardRow,
	getCardRows,
	getFolderRows,
	getIdentityRow,
	getIdentityRows,
	getNoteRow,
	getNoteRows,
	getPasswordRow,
	getPasswordRows,
	getTodoRow,
	getTodoRows,
	upsertCardRow,
	upsertFolderRow,
	upsertIdentityRow,
	upsertNoteRow,
	upsertPasswordRow,
	upsertTodoRow,
} = contentRepository;

describe("contentRepository", () => {
	it("queries folder/note/todo/password/card/identity rows", async () => {
		const database = {
			getAllAsync: vi
				.fn()
				.mockResolvedValueOnce([{ id: "f1" }])
				.mockResolvedValueOnce([{ id: "n1" }])
				.mockResolvedValueOnce([{ id: "t1" }])
				.mockResolvedValueOnce([{ id: "p1" }])
				.mockResolvedValueOnce([{ id: "c1" }])
				.mockResolvedValueOnce([{ id: "i1" }]),
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ id: "n1" })
				.mockResolvedValueOnce({ id: "t1" })
				.mockResolvedValueOnce({ id: "p1" })
				.mockResolvedValueOnce({ id: "c1" })
				.mockResolvedValueOnce({ id: "i1" }),
		} as any;

		expect(await getFolderRows(database, "NOTE")).toEqual([{ id: "f1" }]);
		expect(await getNoteRows(database)).toEqual([{ id: "n1" }]);
		expect(await getTodoRows(database)).toEqual([{ id: "t1" }]);
		expect(await getPasswordRows(database)).toEqual([{ id: "p1" }]);
		expect(await getCardRows(database)).toEqual([{ id: "c1" }]);
		expect(await getIdentityRows(database)).toEqual([{ id: "i1" }]);

		expect(await getNoteRow(database, "n1")).toEqual({ id: "n1" });
		expect(await getTodoRow(database, "t1")).toEqual({ id: "t1" });
		expect(await getPasswordRow(database, "p1")).toEqual({ id: "p1" });
		expect(await getCardRow(database, "c1")).toEqual({ id: "c1" });
		expect(await getIdentityRow(database, "i1")).toEqual({ id: "i1" });
	});

	it("upserts all content entities", async () => {
		const database = { runAsync: vi.fn(async () => {}) } as any;

		await upsertFolderRow(database, {
			id: "f1",
			name: "Work",
			type: "NOTE",
			createdAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO folders"),
			"f1",
			"Work",
			"NOTE",
			1,
			2,
		);

		await upsertNoteRow(database, {
			id: "n1",
			folderId: "f1",
			folderName: null,
			title: "T",
			content: "C",
			createdAt: 1,
			updatedAt: 2,
			hasAttachment: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO notes"),
			"n1",
			"f1",
			"T",
			"C",
			1,
			2,
		);

		await upsertTodoRow(database, {
			id: "t1",
			folderId: "f1",
			folderName: null,
			title: "Todo",
			description: "D",
			isDone: true,
			dueAt: 10,
			createdAt: 1,
			updatedAt: 2,
			hasAttachment: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO todos"),
			"t1",
			"f1",
			"Todo",
			"D",
			1,
			10,
			1,
			2,
		);

		await upsertPasswordRow(database, {
			id: "p1",
			title: "Site",
			username: "u",
			password: "pw",
			website: "w",
			notes: "n",
			createdAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO passwords"),
			"p1",
			"Site",
			"u",
			"pw",
			"w",
			"n",
			1,
			2,
		);

		await upsertCardRow(database, {
			id: "c1",
			name: "Card",
			cardNumber: "1111",
			cardType: "CREDIT_CARD",
			expiry: "12/30",
			cvv: "111",
			pin: "0000",
			network: "VISA",
			notes: "note",
			createdAt: 1,
			updatedAt: 2,
			hasAttachment: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO cards"),
			"c1",
			"Card",
			"1111",
			"CREDIT_CARD",
			"12/30",
			"111",
			"0000",
			"VISA",
			"note",
			1,
			2,
		);

		await upsertIdentityRow(database, {
			id: "i1",
			title: "Passport",
			idNumber: "P1",
			notes: "n",
			createdAt: 1,
			updatedAt: 2,
			hasAttachment: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO identities"),
			"i1",
			"Passport",
			"P1",
			"n",
			1,
			2,
		);
	});

	it("maps todo isDone false to 0 in upsertTodoRow", async () => {
		const database = { runAsync: vi.fn(async () => {}) } as any;

		await upsertTodoRow(database, {
			id: "t2",
			folderId: "f1",
			folderName: null,
			title: "Todo false",
			description: "D",
			isDone: false,
			dueAt: null,
			createdAt: 10,
			updatedAt: 20,
			hasAttachment: false,
		});

		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO todos"),
			"t2",
			"f1",
			"Todo false",
			"D",
			0,
			null,
			10,
			20,
		);
	});

	it("deletes folder and deletes content rows with and without attachments", async () => {
		const database = {
			runAsync: vi.fn(async () => {}),
			withTransactionAsync: vi.fn(
				async (callback: () => Promise<void>) => {
					await callback();
				},
			),
		} as any;

		await deleteFolderRow(database, "f1");
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM folders WHERE id = ?;",
			"f1",
		);

		await deleteContentRow(database, "notes", "NOTE", "n1");
		expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM attachments WHERE owner_type = ? AND owner_id = ?;",
			"NOTE",
			"n1",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM notes WHERE id = ?;",
			"n1",
		);

		await deleteContentRow(database, "passwords", null, "p1");
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM passwords WHERE id = ?;",
			"p1",
		);
	});
});
