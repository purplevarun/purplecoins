import type SettingRow from "@/types/SettingRow";
import type { SQLiteDatabase } from "expo-sqlite";

const getSettingRow = async (
	database: SQLiteDatabase,
	key: string,
): Promise<string | null> => {
	const row = await database.getFirstAsync<SettingRow>(
		"SELECT value FROM settings WHERE key = ?;",
		key,
	);
	return row?.value ?? null;
};

const upsertSettingRow = async (
	database: SQLiteDatabase,
	key: string,
	value: string,
	updatedAt: number,
): Promise<void> => {
	const result = await database.runAsync(
		"UPDATE settings SET value = ?, updated_at = ? WHERE key = ?;",
		value,
		updatedAt,
		key,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`
			INSERT INTO settings (key, value, updated_at)
			VALUES (?, ?, ?);
		`,
		key,
		value,
		updatedAt,
	);
};

const settingsRepository = {
	getSettingRow,
	upsertSettingRow,
};

export default settingsRepository;
