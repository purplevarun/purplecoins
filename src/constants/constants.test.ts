import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import financeConstants from "@/constants/financeConstants";
import folderConstants from "@/constants/folderConstants";
import HOME_MODES from "@/constants/homeModes";

import { describe, expect, it } from "vitest";

describe("constants", () => {
	it("exposes app constants", () => {
		expect(appConstants.APP_NAME).toBe("Purplecoins");
		expect(appConstants.DATABASE_NAME).toBe("purplecoins.db");
		expect(appConstants.DEFAULT_CURRENCY_CODE).toBe("INR");
		expect(appConstants.MILLISECONDS_PER_DAY).toBe(86_400_000);
	});

	it("exposes visual constants", () => {
		expect(COLORS.background).toBe("#080B14");
		expect(COLORS.white).toBe("#FFFFFF");
	});

	it("exposes finance constants", () => {
		expect(financeConstants.TRANSACTION_TYPES).toEqual([
			"DEBIT",
			"CREDIT",
			"TRANSFER",
		]);
		expect(financeConstants.ANALYSIS_PERIODS).toContain("FY");
		expect(financeConstants.VAULT_KINDS).toContain("IDENTITY");
	});

	it("exposes folder/home constants", () => {
		expect(folderConstants.FOLDER_FILTER_ALL).toBe("__ALL_FOLDERS__");
		expect(folderConstants.FOLDER_FILTER_NONE).toBe("__NO_FOLDER__");
		expect(HOME_MODES).toEqual(["TOOLS", "FINANCE", "VAULT"]);
	});
});
