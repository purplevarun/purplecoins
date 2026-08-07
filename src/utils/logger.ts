export type LogLevel = "info" | "warn" | "error";

export type LogEntry = Readonly<{
	id: number;
	level: LogLevel;
	message: string;
	timestamp: number;
	detail?: string;
}>;

const MAX_ENTRIES = 500;

let nextId = 1;
const entries: LogEntry[] = [];

const add = (level: LogLevel, message: string, detail?: unknown): void => {
	const detailStr =
		detail !== undefined
			? detail instanceof Error
				? `${detail.message}${detail.stack ? `\n${detail.stack}` : ""}`
				: typeof detail === "string"
					? detail
					: JSON.stringify(detail, null, 2)
			: undefined;

	entries.push({ id: nextId++, level, message, timestamp: Date.now(), detail: detailStr });
	if (entries.length > MAX_ENTRIES) {
		entries.splice(0, entries.length - MAX_ENTRIES);
	}
};

const info = (message: string, detail?: unknown): void => add("info", message, detail);
const warn = (message: string, detail?: unknown): void => add("warn", message, detail);
const error = (message: string, detail?: unknown): void => add("error", message, detail);
const getLogs = (): readonly LogEntry[] => [...entries].reverse();
const clearLogs = (): void => { entries.length = 0; };

const appLogger = { info, warn, error, getLogs, clearLogs };
export default appLogger;
