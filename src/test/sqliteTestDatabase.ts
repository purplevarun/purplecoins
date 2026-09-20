import type SqliteTestDatabase from "@/types/SqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { onTestFinished } from "vitest";

const createTestDatabase = (): SqliteTestDatabase => {
	const sqlite = new DatabaseSync(":memory:");
	onTestFinished(() => sqlite.close());
	const adapter = {
		execAsync: (sql: string): Promise<void> => {
			sqlite.exec(sql);
			return Promise.resolve();
		},
		runAsync: (
			sql: string,
			...parameters: SQLInputValue[]
		): Promise<unknown> =>
			Promise.resolve(sqlite.prepare(sql).run(...parameters)),
		getAllAsync: (
			sql: string,
			...parameters: SQLInputValue[]
		): Promise<unknown[]> =>
			Promise.resolve(sqlite.prepare(sql).all(...parameters)),
		getFirstAsync: (
			sql: string,
			...parameters: SQLInputValue[]
		): Promise<unknown> =>
			Promise.resolve(sqlite.prepare(sql).get(...parameters) ?? null),
		withTransactionAsync: async (
			callback: () => Promise<void>,
		): Promise<void> => {
			sqlite.exec("BEGIN;");
			try {
				await callback();
				sqlite.exec("COMMIT;");
			} catch (error) {
				sqlite.exec("ROLLBACK;");
				throw error;
			}
		},
	};
	return { sqlite, database: adapter as unknown as SQLiteDatabase };
};

export default createTestDatabase;
