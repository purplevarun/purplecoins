import { describe, expect, it, vi } from "vitest";

vi.mock("@/constants/typography", () => ({
	default: {
		FONT_FAMILY: "AppFont",
	},
}));

vi.mock("react-native", () => ({
	Platform: { OS: "ios" },
	StyleSheet: {
		flatten: (style: any) => style ?? {},
	},
}));

import applyAppFontStyle from "@/utils/appFontStyle";

describe("applyAppFontStyle on iOS", () => {
	it("keeps fontWeight on non-android platforms", () => {
		expect(applyAppFontStyle({ fontSize: 16, fontWeight: "700" })).toEqual({
			fontFamily: "AppFont",
			fontSize: 16,
			fontWeight: "700",
		});
	});
});
