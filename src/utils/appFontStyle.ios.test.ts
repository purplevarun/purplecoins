import { describe, expect, it, vi } from "vitest";

describe("applyAppFontStyle on iOS", () => {
	it("keeps fontWeight on non-android platforms", async () => {
		vi.resetModules();
		vi.doMock("@/constants/typography", () => ({
			default: {
				FONT_FAMILY: "AppFont",
			},
		}));
		vi.doMock("react-native", () => ({
			Platform: { OS: "ios" },
			StyleSheet: {
				flatten: (style: any) => style ?? {},
			},
		}));

		const module = await import("@/utils/appFontStyle");
		expect(module.default({ fontSize: 16, fontWeight: "700" })).toEqual({
			fontFamily: "AppFont",
			fontSize: 16,
			fontWeight: "700",
		});
	});
});