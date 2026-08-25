import { describe, expect, it, vi } from "vitest";

vi.mock("@/constants/typography", () => ({
	default: {
		FONT_FAMILY: "AppFont",
	},
}));

vi.mock("react-native", () => ({
	Platform: { OS: "android" },
	StyleSheet: {
		flatten: (style: any) => style ?? {},
	},
}));

import applyAppFontStyle from "@/utils/appFontStyle";

describe("applyAppFontStyle", () => {
	it("applies font family and removes fontWeight on android", () => {
		const result = applyAppFontStyle({ fontSize: 16, fontWeight: "700" });
		expect(result).toEqual({
			fontFamily: "AppFont",
			fontSize: 16,
		});
	});

	it("handles empty style", () => {
		expect(applyAppFontStyle()).toEqual({ fontFamily: "AppFont" });
	});
});
