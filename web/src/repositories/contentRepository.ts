import type { WebDatabase } from "@/db/database";

import type { CardEntry } from "@/types/CardEntry";
import type { Folder } from "@/types/Folder";
import type { IdentityEntry } from "@/types/IdentityEntry";
import type { Note } from "@/types/Note";
import type { PasswordEntry } from "@/types/PasswordEntry";
import type { Todo } from "@/types/Todo";

const getFolderRows = async (
	database: WebDatabase,
	type: "NOTE" | "TODO",
): Promise<readonly Folder[]> =>
	database.getAllAsync<Folder>(
		`
			SELECT id, name, type, created_at AS createdAt, updated_at AS updatedAt
			FROM folders
			WHERE type = ?
			ORDER BY lower(name);
		`,
		type,
	);

const upsertFolderRow = async (
	database: WebDatabase,
	folder: Folder,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO folders (id, name, type, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				updated_at = excluded.updated_at;
		`,
		folder.id,
		folder.name,
		folder.type,
		folder.createdAt,
		folder.updatedAt,
	);
};

const deleteFolderRow = async (
	database: WebDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync("DELETE FROM folders WHERE id = ?;", id);
};

const getNoteRows = async (database: WebDatabase): Promise<readonly Note[]> =>
	database.getAllAsync<Note>(`
		SELECT
			note.id,
			note.folder_id AS folderId,
			folder.name AS folderName,
			note.title,
			note.content,
			note.created_at AS createdAt,
			note.updated_at AS updatedAt,
			EXISTS(
				SELECT 1 FROM attachments attachment
				WHERE attachment.owner_type = 'NOTE'
					AND attachment.owner_id = note.id
			) AS hasAttachment
		FROM notes note
		LEFT JOIN folders folder ON folder.id = note.folder_id
		ORDER BY note.updated_at DESC;
	`);

const getNoteRow = async (
	database: WebDatabase,
	id: string,
): Promise<Note | null> =>
	database.getFirstAsync<Note>(
		`
			SELECT
				note.id,
				note.folder_id AS folderId,
				folder.name AS folderName,
				note.title,
				note.content,
				note.created_at AS createdAt,
				note.updated_at AS updatedAt,
				EXISTS(
					SELECT 1 FROM attachments attachment
					WHERE attachment.owner_type = 'NOTE'
						AND attachment.owner_id = note.id
				) AS hasAttachment
			FROM notes note
			LEFT JOIN folders folder ON folder.id = note.folder_id
			WHERE note.id = ?;
		`,
		id,
	);

const upsertNoteRow = async (
	database: WebDatabase,
	note: Note,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO notes (
				id, folder_id, title, content, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				folder_id = excluded.folder_id,
				title = excluded.title,
				content = excluded.content,
				updated_at = excluded.updated_at;
		`,
		note.id,
		note.folderId,
		note.title,
		note.content,
		note.createdAt,
		note.updatedAt,
	);
};

const getTodoRows = async (database: WebDatabase): Promise<readonly Todo[]> =>
	database.getAllAsync<Todo>(`
		SELECT
			todo.id,
			todo.folder_id AS folderId,
			folder.name AS folderName,
			todo.title,
			todo.description,
			todo.is_done AS isDone,
			todo.due_at AS dueAt,
			todo.created_at AS createdAt,
			todo.updated_at AS updatedAt,
			EXISTS(
				SELECT 1 FROM attachments attachment
				WHERE attachment.owner_type = 'TODO'
					AND attachment.owner_id = todo.id
			) AS hasAttachment
		FROM todos todo
		LEFT JOIN folders folder ON folder.id = todo.folder_id
		ORDER BY todo.is_done, todo.due_at IS NULL, todo.due_at, todo.updated_at DESC;
	`);

const getTodoRow = async (
	database: WebDatabase,
	id: string,
): Promise<Todo | null> =>
	database.getFirstAsync<Todo>(
		`
			SELECT
				todo.id,
				todo.folder_id AS folderId,
				folder.name AS folderName,
				todo.title,
				todo.description,
				todo.is_done AS isDone,
				todo.due_at AS dueAt,
				todo.created_at AS createdAt,
				todo.updated_at AS updatedAt,
				EXISTS(
					SELECT 1 FROM attachments attachment
					WHERE attachment.owner_type = 'TODO'
						AND attachment.owner_id = todo.id
				) AS hasAttachment
			FROM todos todo
			LEFT JOIN folders folder ON folder.id = todo.folder_id
			WHERE todo.id = ?;
		`,
		id,
	);

const upsertTodoRow = async (
	database: WebDatabase,
	todo: Todo,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO todos (
				id, folder_id, title, description, is_done, due_at,
				created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				folder_id = excluded.folder_id,
				title = excluded.title,
				description = excluded.description,
				is_done = excluded.is_done,
				due_at = excluded.due_at,
				updated_at = excluded.updated_at;
		`,
		todo.id,
		todo.folderId,
		todo.title,
		todo.description,
		todo.isDone ? 1 : 0,
		todo.dueAt,
		todo.createdAt,
		todo.updatedAt,
	);
};

const getPasswordRows = async (
	database: WebDatabase,
): Promise<readonly PasswordEntry[]> =>
	database.getAllAsync<PasswordEntry>(`
		SELECT
			id,
			title,
			username,
			password,
			website,
			notes,
			created_at AS createdAt,
			updated_at AS updatedAt
		FROM passwords
		ORDER BY lower(title);
	`);

const getPasswordRow = async (
	database: WebDatabase,
	id: string,
): Promise<PasswordEntry | null> =>
	database.getFirstAsync<PasswordEntry>(
		`
			SELECT
				id, title, username, password, website, notes,
				created_at AS createdAt, updated_at AS updatedAt
			FROM passwords
			WHERE id = ?;
		`,
		id,
	);

const upsertPasswordRow = async (
	database: WebDatabase,
	entry: PasswordEntry,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO passwords (
				id, title, username, password, website, notes,
				created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				title = excluded.title,
				username = excluded.username,
				password = excluded.password,
				website = excluded.website,
				notes = excluded.notes,
				updated_at = excluded.updated_at;
		`,
		entry.id,
		entry.title,
		entry.username,
		entry.password,
		entry.website,
		entry.notes,
		entry.createdAt,
		entry.updatedAt,
	);
};

const getCardRows = async (
	database: WebDatabase,
): Promise<readonly CardEntry[]> =>
	database.getAllAsync<CardEntry>(`
		SELECT
			card.id,
			card.name,
			card.card_number AS cardNumber,
			card.expiry,
			card.cvv,
			card.pin,
			card.network,
			card.notes,
			card.created_at AS createdAt,
			card.updated_at AS updatedAt,
			EXISTS(
				SELECT 1 FROM attachments attachment
				WHERE attachment.owner_type = 'CARD'
					AND attachment.owner_id = card.id
			) AS hasAttachment
		FROM cards card
		ORDER BY lower(card.name);
	`);

const getCardRow = async (
	database: WebDatabase,
	id: string,
): Promise<CardEntry | null> =>
	database.getFirstAsync<CardEntry>(
		`
			SELECT
				card.id,
				card.name,
				card.card_number AS cardNumber,
				card.expiry,
				card.cvv,
				card.pin,
				card.network,
				card.notes,
				card.created_at AS createdAt,
				card.updated_at AS updatedAt,
				EXISTS(
					SELECT 1 FROM attachments attachment
					WHERE attachment.owner_type = 'CARD'
						AND attachment.owner_id = card.id
				) AS hasAttachment
			FROM cards card
			WHERE card.id = ?;
		`,
		id,
	);

const upsertCardRow = async (
	database: WebDatabase,
	entry: CardEntry,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO cards (
				id, name, card_number, expiry, cvv, pin, network, notes,
				created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				card_number = excluded.card_number,
				expiry = excluded.expiry,
				cvv = excluded.cvv,
				pin = excluded.pin,
				network = excluded.network,
				notes = excluded.notes,
				updated_at = excluded.updated_at;
		`,
		entry.id,
		entry.name,
		entry.cardNumber,
		entry.expiry,
		entry.cvv,
		entry.pin,
		entry.network,
		entry.notes,
		entry.createdAt,
		entry.updatedAt,
	);
};

const getIdentityRows = async (
	database: WebDatabase,
): Promise<readonly IdentityEntry[]> =>
	database.getAllAsync<IdentityEntry>(`
		SELECT
			identity.id,
			identity.title,
			identity.id_number AS idNumber,
			identity.notes,
			identity.created_at AS createdAt,
			identity.updated_at AS updatedAt,
			EXISTS(
				SELECT 1 FROM attachments attachment
				WHERE attachment.owner_type = 'IDENTITY'
					AND attachment.owner_id = identity.id
			) AS hasAttachment
		FROM identities identity
		ORDER BY lower(identity.title);
	`);

const getIdentityRow = async (
	database: WebDatabase,
	id: string,
): Promise<IdentityEntry | null> =>
	database.getFirstAsync<IdentityEntry>(
		`
			SELECT
				identity.id,
				identity.title,
				identity.id_number AS idNumber,
				identity.notes,
				identity.created_at AS createdAt,
				identity.updated_at AS updatedAt,
				EXISTS(
					SELECT 1 FROM attachments attachment
					WHERE attachment.owner_type = 'IDENTITY'
						AND attachment.owner_id = identity.id
				) AS hasAttachment
			FROM identities identity
			WHERE identity.id = ?;
		`,
		id,
	);

const upsertIdentityRow = async (
	database: WebDatabase,
	entry: IdentityEntry,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO identities (
				id, title, id_number, notes, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				title = excluded.title,
				id_number = excluded.id_number,
				notes = excluded.notes,
				updated_at = excluded.updated_at;
		`,
		entry.id,
		entry.title,
		entry.idNumber,
		entry.notes,
		entry.createdAt,
		entry.updatedAt,
	);
};

const deleteContentRow = async (
	database: WebDatabase,
	tableName: "notes" | "todos" | "passwords" | "cards" | "identities",
	ownerType: "NOTE" | "TODO" | "CARD" | "IDENTITY" | null,
	id: string,
): Promise<void> => {
	await database.withTransactionAsync(async (): Promise<void> => {
		if (ownerType) {
			await database.runAsync(
				"DELETE FROM attachments WHERE owner_type = ? AND owner_id = ?;",
				ownerType,
				id,
			);
		}
		await database.runAsync(`DELETE FROM ${tableName} WHERE id = ?;`, id);
	});
};

export {
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
};
