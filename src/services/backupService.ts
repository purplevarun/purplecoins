import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	backupDatabaseAsync,
	openDatabaseAsync,
	type SQLiteDatabase,
} from "expo-sqlite";

import {
	APP_NAME,
	BACKUP_EXTENSION,
	BACKUP_MIME_TYPE,
} from "@/constants/appConstants";
import { SCHEMA_SQL } from "@/database/schema";
import { AppError } from "@/errors/AppError";

const createBackupFileName = (): string => {
	const date = new Date().toISOString().slice(0, 10);
	return `${APP_NAME.toLowerCase()}-${date}${BACKUP_EXTENSION}`;
};

const exportBackup = async (database: SQLiteDatabase): Promise<void> => {
	const integrity = await database.getFirstAsync<
		Readonly<{ integrity: string }>
	>("SELECT integrity_check AS integrity FROM pragma_integrity_check;");
	if (integrity?.integrity !== "ok") {
		throw new AppError(
			"DATABASE_INTEGRITY_FAILED",
			"Database integrity check failed. Backup was not created.",
		);
	}
	const output = new File(Paths.cache, createBackupFileName());
	output.create({ overwrite: true, intermediates: true });
	output.write(await database.serializeAsync());
	if (!(await Sharing.isAvailableAsync())) {
		throw new AppError(
			"SHARING_UNAVAILABLE",
			"Backup sharing is unavailable on this device.",
		);
	}
	await Sharing.shareAsync(output.uri, {
		mimeType: BACKUP_MIME_TYPE,
		dialogTitle: "Export Gringotts backup",
	});
};

const TEMP_RESTORE_DB_NAME = "restore-temp.db";

const restoreBackup = async (database: SQLiteDatabase): Promise<boolean> => {
	const result = await DocumentPicker.getDocumentAsync({
		type: [BACKUP_MIME_TYPE, "application/octet-stream", "*/*"],
		copyToCacheDirectory: true,
		multiple: false,
	});
	if (result.canceled) {
		return false;
	}
	const asset = result.assets[0];
	if (!asset) {
		throw new AppError("BACKUP_NOT_SELECTED", "No backup was selected.");
	}
	if (!asset.name.toLowerCase().endsWith(BACKUP_EXTENSION)) {
		throw new AppError(
			"INVALID_BACKUP_EXTENSION",
			`Select a ${BACKUP_EXTENSION} file.`,
		);
	}

	const pickedFile = new File(asset.uri);
	const tempFile = new File(
		new File(Paths.document, "SQLite"),
		TEMP_RESTORE_DB_NAME,
	);
	if (tempFile.exists) tempFile.delete();
	tempFile.create({ overwrite: true });
	tempFile.write(await pickedFile.bytes());
	console.log("[restore] 1. bytes written, size:", tempFile.size);

	const tempDatabase = await openDatabaseAsync(TEMP_RESTORE_DB_NAME);
	console.log("[restore] 2. temp DB opened");

	const tempCount = await tempDatabase.getFirstAsync<{ count: number }>(
		"SELECT COUNT(*) as count FROM transactions;",
	);
	console.log("[restore] 3. transactions in temp DB:", tempCount?.count);

	try {
		await backupDatabaseAsync({
			sourceDatabase: tempDatabase,
			destDatabase: database,
		});
		console.log("[restore] 4. backupDatabaseAsync done");

		await database.execAsync(SCHEMA_SQL);
		await database.execAsync("PRAGMA wal_checkpoint(TRUNCATE);");

		const liveCount = await database.getFirstAsync<{ count: number }>(
			"SELECT COUNT(*) as count FROM transactions;",
		);
		console.log("[restore] 5. transactions in live DB:", liveCount?.count);

		return true;
	} finally {
		await tempDatabase.closeAsync();
		if (tempFile.exists) tempFile.delete();
	}
};

export { exportBackup, restoreBackup };
