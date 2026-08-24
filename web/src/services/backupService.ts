import { APP_NAME, BACKUP_EXTENSION } from "@/constants/appConstants";
import type { WebDatabase } from "@/db/database";
import { createAdapter, exportDatabase, importDatabase } from "@/db/database";
import { SCHEMA_SQL } from "@/db/schema";

const createBackupFileName = (): string => {
	const date = new Date().toISOString().slice(0, 10);
	return `${APP_NAME.toLowerCase()}-${date}${BACKUP_EXTENSION}`;
};

export const exportBackup = (): void => {
	const bytes = exportDatabase();
	const blob = new Blob([bytes.buffer as ArrayBuffer], {
		type: "application/x-sqlite3",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = createBackupFileName();
	a.click();
	URL.revokeObjectURL(url);
};

export const importBackup = async (): Promise<WebDatabase> => {
	return new Promise((resolve, reject) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = BACKUP_EXTENSION + ",.db,.sqlite,.sqlite3";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return reject(new Error("No file selected"));
			const arrayBuffer = await file.arrayBuffer();
			const bytes = new Uint8Array(arrayBuffer);
			const db = await importDatabase(bytes);
			db.run(SCHEMA_SQL);
			resolve(createAdapter(db));
		};
		input.click();
	});
};
