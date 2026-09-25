import AppError from "@/errors/AppError";
import platformRepository from "@/repositories/platformRepository";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	getPlatformRows,
	platformNameExistsRow,
	upsertPlatformRow,
	platformInUseRow,
	deletePlatformRow,
	setPlatformArchivedRow,
} = platformRepository;

const getPlatforms = async (database: SQLiteDatabase) =>
	getPlatformRows(database);

const savePlatform = async (
	database: SQLiteDatabase,
	name: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"PLATFORM_NAME_REQUIRED",
			"Platform name is required.",
		);
	}
	if (await platformNameExistsRow(database, normalizedName)) {
		throw new AppError(
			"PLATFORM_NAME_DUPLICATE",
			`A platform named "${normalizedName}" already exists.`,
		);
	}
	const now = Date.now();
	const id = createId();
	await upsertPlatformRow(database, {
		id,
		name: normalizedName,
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const deletePlatform = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	if (await platformInUseRow(database, id)) {
		throw new AppError(
			"PLATFORM_IN_USE",
			"Platform is referenced by investments and cannot be deleted.",
		);
	}
	await deletePlatformRow(database, id);
};

const setPlatformArchived = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
): Promise<void> => {
	await setPlatformArchivedRow(database, id, archived, Date.now());
};

const platformService = {
	getPlatforms,
	savePlatform,
	deletePlatform,
	setPlatformArchived,
};

export default platformService;
