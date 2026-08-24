import type { Database, QueryExecResult, SqlJsStatic } from "sql.js";
import { SCHEMA_SQL } from "./schema";

const DB_STORAGE_KEY = "purplecoins_db";
let _db: Database | null = null;

const loadSqlJs = async (): Promise<SqlJsStatic> => {
	// sql.js doesn't have a proper ESM default export - load via window global
	await new Promise<void>((resolve, reject) => {
		if ((window as any).initSqlJs) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.src =
			"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js";
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load sql.js"));
		document.head.appendChild(script);
	});
	const SQL: SqlJsStatic = await (window as any).initSqlJs({
		locateFile: () =>
			"https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm",
	});
	return SQL;
};

export const initDatabase = async (): Promise<Database> => {
	const SQL = await loadSqlJs();
	const stored = localStorage.getItem(DB_STORAGE_KEY);
	if (stored) {
		const binary = atob(stored);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		_db = new SQL.Database(bytes);
	} else {
		_db = new SQL.Database();
	}
	_db.run(SCHEMA_SQL);
	persist();
	return _db;
};

export const getDatabase = (): Database => {
	if (!_db) throw new Error("Database not initialized");
	return _db;
};

export const persist = (): void => {
	if (!_db) return;
	const data = _db.export();
	let binary = "";
	for (let i = 0; i < data.length; i++)
		binary += String.fromCharCode(data[i]);
	localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
};

export const importDatabase = async (bytes: Uint8Array): Promise<Database> => {
	const SQL = await loadSqlJs();
	_db = new SQL.Database(bytes);
	_db.run(SCHEMA_SQL);
	persist();
	return _db;
};

export const exportDatabase = (): Uint8Array => {
	return getDatabase().export();
};

export const clearDatabase = async (): Promise<Database> => {
	localStorage.removeItem(DB_STORAGE_KEY);
	const SQL = await loadSqlJs();
	_db = new SQL.Database();
	_db.run(SCHEMA_SQL);
	persist();
	return _db;
};

export type WebDatabase = {
	getAllAsync: <T>(
		sql: string,
		...params: unknown[]
	) => Promise<readonly T[]>;
	getFirstAsync: <T>(sql: string, ...params: unknown[]) => Promise<T | null>;
	runAsync: (sql: string, ...params: unknown[]) => Promise<void>;
	withTransactionAsync: (fn: () => Promise<void>) => Promise<void>;
	execAsync: (sql: string) => Promise<void>;
};

const flattenParams = (params: unknown[]): unknown[] => {
	if (params.length === 1 && Array.isArray(params[0])) return params[0];
	return params;
};

const rowToObject = (result: QueryExecResult): Record<string, unknown>[] =>
	result.values.map((row) => {
		const obj: Record<string, unknown> = {};
		result.columns.forEach((col, i) => {
			obj[col] = row[i];
		});
		return obj;
	});

export const createAdapter = (db: Database): WebDatabase => ({
	getAllAsync: async <T>(
		sql: string,
		...params: unknown[]
	): Promise<readonly T[]> => {
		const results = db.exec(sql, flattenParams(params) as any);
		if (!results.length) return [];
		return rowToObject(results[0]) as T[];
	},
	getFirstAsync: async <T>(
		sql: string,
		...params: unknown[]
	): Promise<T | null> => {
		const results = db.exec(sql, flattenParams(params) as any);
		if (!results.length || !results[0].values.length) return null;
		return rowToObject(results[0])[0] as T;
	},
	runAsync: async (sql: string, ...params: unknown[]): Promise<void> => {
		db.run(sql, flattenParams(params) as any);
		persist();
	},
	withTransactionAsync: async (fn: () => Promise<void>): Promise<void> => {
		db.run("BEGIN;");
		try {
			await fn();
			db.run("COMMIT;");
			persist();
		} catch (err) {
			db.run("ROLLBACK;");
			throw err;
		}
	},
	execAsync: async (sql: string): Promise<void> => {
		db.run(sql);
		persist();
	},
});
