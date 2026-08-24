import type { WebDatabase } from "@/db/database";

import {
	getSettingRow,
	upsertSettingRow,
} from "@/repositories/settingsRepository";

const NATIVE_CURRENCY_KEY = "native_currency_display";

const getNativeCurrencyDisplay = async (
	database: WebDatabase,
): Promise<boolean> => {
	const value = await getSettingRow(database, NATIVE_CURRENCY_KEY);
	return value === null ? true : value === "true";
};

const updateNativeCurrencyDisplay = async (
	database: WebDatabase,
	isNativeCurrency: boolean,
): Promise<void> =>
	upsertSettingRow(
		database,
		NATIVE_CURRENCY_KEY,
		String(isNativeCurrency),
		Date.now(),
	);

export { getNativeCurrencyDisplay, updateNativeCurrencyDisplay };
