import type Platform from "@/types/Platform";
import type SimpleEntity from "@/types/SimpleEntity";
import type { SQLiteDatabase } from "expo-sqlite";

const getPlatformRows = async (
	database: SQLiteDatabase,
): Promise<readonly Platform[]> =>
	database.getAllAsync<Platform>(`
    SELECT id, name, created_at AS createdAt, updated_at AS updatedAt, COALESCE(archived,0) AS archived
    FROM investment_platforms
    ORDER BY lower(name) ASC;
  `);

const getPlatformRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Platform | null> =>
	database.getFirstAsync<Platform>(
		`
    SELECT id, name, created_at AS createdAt, updated_at AS updatedAt, COALESCE(archived,0) AS archived
    FROM investment_platforms WHERE id = ?;
  `,
		id,
	);

const upsertPlatformRow = async (
	database: SQLiteDatabase,
	entity: SimpleEntity,
): Promise<void> => {
	const result = await database.runAsync(
		`UPDATE investment_platforms SET name = ?, updated_at = ? WHERE id = ?;`,
		entity.name,
		entity.updatedAt,
		entity.id,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`INSERT INTO investment_platforms (id, name, created_at, updated_at) VALUES (?, ?, ?, ?);`,
		entity.id,
		entity.name,
		entity.createdAt,
		entity.updatedAt,
	);
};

const platformNameExistsRow = async (
	database: SQLiteDatabase,
	name: string,
): Promise<boolean> => {
	const row = await database.getFirstAsync<Pick<SimpleEntity, "id">>(
		`SELECT id FROM investment_platforms WHERE lower(name) = lower(?) LIMIT 1;`,
		name,
	);
	return row !== null;
};

const deletePlatformRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync(
		`DELETE FROM investment_platforms WHERE id = ?;`,
		id,
	);
};

const setPlatformArchivedRow = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
	updatedAt: number,
): Promise<void> => {
	await database.runAsync(
		`UPDATE investment_platforms SET archived = ?, updated_at = ? WHERE id = ?;`,
		archived ? 1 : 0,
		updatedAt,
		id,
	);
};

const platformInUseRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<boolean> => {
	const row = await database.getFirstAsync<Pick<SimpleEntity, "id">>(
		`SELECT id FROM investments WHERE platform_id = ? LIMIT 1;`,
		id,
	);
	return row !== null;
};

export default {
	getPlatformRows,
	getPlatformRow,
	upsertPlatformRow,
	platformNameExistsRow,
	deletePlatformRow,
	setPlatformArchivedRow,
	platformInUseRow,
};
