import type { WebDatabase } from "@/db/database";

const getSettingRow = async (
	database: WebDatabase,
	key: string,
): Promise<string | null> => {
	const row = await database.getFirstAsync<Readonly<{ value: string }>>(
		"SELECT value FROM settings WHERE key = ?;",
		key,
	);
	return row?.value ?? null;
};

const upsertSettingRow = async (
	database: WebDatabase,
	key: string,
	value: string,
	updatedAt: number,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO settings (key, value, updated_at)
			VALUES (?, ?, ?)
			ON CONFLICT(key) DO UPDATE SET
				value = excluded.value,
				updated_at = excluded.updated_at;
		`,
		key,
		value,
		updatedAt,
	);
};

export { getSettingRow, upsertSettingRow };
