import AppError from "@/errors/AppError";
import contentRepository from "@/repositories/contentRepository";
import type PasswordEntry from "@/types/PasswordEntry";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteContentRow, getPasswordRow, getPasswordRows, upsertPasswordRow } =
	contentRepository;

const getPasswords = async (
	database: SQLiteDatabase,
): Promise<readonly PasswordEntry[]> => getPasswordRows(database);

const getPassword = async (
	database: SQLiteDatabase,
	id: string,
): Promise<PasswordEntry | null> => getPasswordRow(database, id);

const savePassword = async (
	database: SQLiteDatabase,
	entry: Readonly<{
		id?: string;
		title: string;
		username: string;
		password: string;
		website: string;
		notes: string;
	}>,
): Promise<string> => {
	const title = entry.title.trim();
	if (!title) {
		throw new AppError(
			"PASSWORD_TITLE_REQUIRED",
			"Password title is required.",
		);
	}
	if (!entry.password) {
		throw new AppError("PASSWORD_REQUIRED", "Password is required.");
	}
	const now = Date.now();
	const existing = entry.id ? await getPasswordRow(database, entry.id) : null;
	const id = entry.id ?? createId();
	await upsertPasswordRow(database, {
		id,
		title,
		username: entry.username.trim(),
		password: entry.password,
		website: entry.website.trim(),
		notes: entry.notes.trim(),
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
	});
	return id;
};

const deletePassword = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => deleteContentRow(database, "passwords", null, id);

const passwordService = {
	deletePassword,
	getPassword,
	getPasswords,
	savePassword,
};

export default passwordService;
