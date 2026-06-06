import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	backupDatabaseAsync,
	deserializeDatabaseAsync,
	type SQLiteDatabase,
} from "expo-sqlite";

import {
	APP_NAME,
	BACKUP_EXTENSION,
	BACKUP_MIME_TYPE,
	SCHEMA_VERSION,
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
	const importedDatabase = await deserializeDatabaseAsync(
		await new File(asset.uri).bytes(),
	);
	try {
		const integrity = await importedDatabase.getFirstAsync<
			Readonly<{ integrity: string }>
		>("SELECT integrity_check AS integrity FROM pragma_integrity_check;");
		const version = await importedDatabase.getFirstAsync<
			Readonly<{ user_version: number }>
		>("PRAGMA user_version;");
		if (integrity?.integrity !== "ok") {
			throw new AppError(
				"INVALID_BACKUP",
				"The selected backup failed its integrity check.",
			);
		}
		if (version?.user_version !== SCHEMA_VERSION) {
			throw new AppError(
				"UNSUPPORTED_BACKUP",
				"The selected backup uses an unsupported schema version.",
			);
		}
		await backupDatabaseAsync({
			sourceDatabase: importedDatabase,
			destDatabase: database,
		});
		await database.execAsync(SCHEMA_SQL);
		return true;
	} finally {
		await importedDatabase.closeAsync();
	}
};

export { exportBackup, restoreBackup };
