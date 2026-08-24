import * as DocumentPicker from "expo-document-picker";

import appConstants from "@/constants/appConstants";
import SCHEMA_SQL from "@/database/schema";
import AppError from "@/errors/AppError";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	backupDatabaseAsync,
	openDatabaseAsync,
	type SQLiteDatabase,
} from "expo-sqlite";

const { APP_NAME, BACKUP_EXTENSION, BACKUP_MIME_TYPE } = appConstants;

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
		dialogTitle: "Export Purplecoins backup",
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

	const tempDatabase = await openDatabaseAsync(TEMP_RESTORE_DB_NAME);

	try {
		await backupDatabaseAsync({
			sourceDatabase: tempDatabase,
			destDatabase: database,
		});

		await database.execAsync(SCHEMA_SQL);
		await database.execAsync("PRAGMA wal_checkpoint(TRUNCATE);");

		return true;
	} finally {
		await tempDatabase.closeAsync();
		if (tempFile.exists) tempFile.delete();
	}
};

const backupService = {
	exportBackup,
	restoreBackup,
};

export default backupService;
