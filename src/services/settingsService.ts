import settingsRepository from "@/repositories/settingsRepository";
import type { SQLiteDatabase } from "expo-sqlite";

const { getSettingRow, upsertSettingRow } = settingsRepository;

const NATIVE_CURRENCY_KEY = "native_currency_display";
const FY_START_MONTH_KEY = "fy_start_month";
const DEFAULT_TRIP_ID_KEY = "default_trip_id";

const getNativeCurrencyDisplay = async (
	database: SQLiteDatabase,
): Promise<boolean> => {
	const value = await getSettingRow(database, NATIVE_CURRENCY_KEY);
	return value === null ? true : value === "true";
};

const updateNativeCurrencyDisplay = async (
	database: SQLiteDatabase,
	isNativeCurrency: boolean,
): Promise<void> =>
	upsertSettingRow(
		database,
		NATIVE_CURRENCY_KEY,
		String(isNativeCurrency),
		Date.now(),
	);

// FY start month: 1=Jan … 12=Dec, default 4 (April)
const getFyStartMonth = async (database: SQLiteDatabase): Promise<number> => {
	const value = await getSettingRow(database, FY_START_MONTH_KEY);
	if (!value) return 4;
	const parsed = parseInt(value, 10);
	return isNaN(parsed) ? 4 : parsed;
};

const updateFyStartMonth = async (
	database: SQLiteDatabase,
	month: number,
): Promise<void> =>
	upsertSettingRow(database, FY_START_MONTH_KEY, String(month), Date.now());

// Default trip
const getDefaultTripId = async (
	database: SQLiteDatabase,
): Promise<string | null> => {
	const value = await getSettingRow(database, DEFAULT_TRIP_ID_KEY);
	return value ?? null;
};

const updateDefaultTripId = async (
	database: SQLiteDatabase,
	tripId: string | null,
): Promise<void> =>
	upsertSettingRow(database, DEFAULT_TRIP_ID_KEY, tripId ?? "", Date.now());

const settingsService = {
	getDefaultTripId,
	getFyStartMonth,
	getNativeCurrencyDisplay,
	updateDefaultTripId,
	updateFyStartMonth,
	updateNativeCurrencyDisplay,
};

export default settingsService;
