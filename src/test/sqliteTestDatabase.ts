import { DatabaseSync } from "node:sqlite";

import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import type { SQLiteDatabase } from "expo-sqlite";

/**
 * A test-only, in-memory implementation of the subset of the `expo-sqlite`
 * `SQLiteDatabase` API that this codebase's repositories/services rely on.
 *
 * `expo-sqlite` wraps native iOS/Android/web SQLite bindings that cannot run
 * inside a plain Node (Vitest) process. Node's own built-in `node:sqlite`
 * module provides a real, synchronous SQLite engine, so we adapt it behind
 * the same async method names (`execAsync`, `runAsync`, `getAllAsync`,
 * `getFirstAsync`, `withTransactionAsync`, `closeAsync`). This lets
 * repository and service tests exercise the *actual* production schema
 * (constraints, foreign keys, uniqueness, triggers-of-conflict, etc.)
 * instead of hand-rolled mocks that could drift from reality.
 */

type SqlBindValue = string | number | bigint | null | Uint8Array;

const toBindValues = (params: readonly unknown[]): SqlBindValue[] =>
	params.map((param) => param as SqlBindValue);

const createDatabaseAdapter = (
	nativeDatabase: DatabaseSync,
): SQLiteDatabase => {
	const execAsync = (source: string): Promise<void> => {
		nativeDatabase.exec(source);
		return Promise.resolve();
	};

	const runAsync = (
		source: string,
		...params: unknown[]
	): Promise<Readonly<{ lastInsertRowId: number; changes: number }>> => {
		const statement = nativeDatabase.prepare(source);
		const result = statement.run(...toBindValues(params));
		return Promise.resolve({
			lastInsertRowId: Number(result.lastInsertRowid),
			changes: Number(result.changes),
		});
	};

	const getAllAsync = <T>(
		source: string,
		...params: unknown[]
	): Promise<T[]> => {
		const statement = nativeDatabase.prepare(source);
		const rows = statement.all(...toBindValues(params));
		return Promise.resolve(rows as unknown as T[]);
	};

	const getFirstAsync = <T>(
		source: string,
		...params: unknown[]
	): Promise<T | null> => {
		const statement = nativeDatabase.prepare(source);
		const row = statement.get(...toBindValues(params));
		return Promise.resolve((row as unknown as T | undefined) ?? null);
	};

	const withTransactionAsync = async (
		task: () => Promise<void>,
	): Promise<void> => {
		nativeDatabase.exec("BEGIN");
		try {
			await task();
			nativeDatabase.exec("COMMIT");
		} catch (error: unknown) {
			nativeDatabase.exec("ROLLBACK");
			throw error;
		}
	};

	const closeAsync = (): Promise<void> => {
		if (nativeDatabase.isOpen) {
			nativeDatabase.close();
		}
		return Promise.resolve();
	};

	const serializeAsync = (): Promise<Uint8Array> =>
		Promise.resolve(nativeDatabase.serialize());

	const fakeDatabase = {
		execAsync,
		runAsync,
		getAllAsync,
		getFirstAsync,
		withTransactionAsync,
		closeAsync,
		serializeAsync,
	};

	return fakeDatabase as unknown as SQLiteDatabase;
};

/**
 * Creates a brand-new, isolated in-memory SQLite database with the app's
 * real production schema applied. Intended to be called once per test
 * (typically inside `beforeEach`) so every test starts from a clean slate.
 */
const createTestDatabase = (): SQLiteDatabase => {
	const nativeDatabase = new DatabaseSync(":memory:", {
		enableForeignKeyConstraints: true,
	});
	nativeDatabase.exec(SCHEMA_SQL);
	// Mirror initializeDatabase.ts's post-schema migrations so tests see the
	// exact same table shape a real device would have (e.g. `archived`
	// columns, which are added via migration rather than the base schema).
	for (const migration of SCHEMA_MIGRATIONS) {
		try {
			nativeDatabase.exec(migration);
		} catch {
			// Column already exists — safe to ignore, matching production.
		}
	}
	return createDatabaseAdapter(nativeDatabase);
};

export default createTestDatabase;
