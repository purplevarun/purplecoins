import { afterEach, describe, expect, it, vi } from "vitest";

// `react-native`'s entry point uses Flow syntax that Vitest's esbuild/rolldown
// transform cannot parse, and `@/constants/typography` does a Metro-only
// `require(...)` of a `.ttf` asset file. Both are mocked here so this pure
// utility can be tested without pulling in the real native/asset pipeline.
// `vi.hoisted` ensures `mockPlatform` exists before the hoisted `vi.mock`
// factories (which run before this file's own top-level statements) execute.
const mockPlatform = vi.hoisted((): { OS: string } => ({ OS: "ios" }));

vi.mock("react-native", () => ({
	Platform: mockPlatform,
	StyleSheet: {
		flatten: (style: unknown): Record<string, unknown> => {
			if (!style) {
				return {};
			}
			if (Array.isArray(style)) {
				const styleArray = style as readonly (
					Record<string, unknown> | null | undefined
				)[];
				return Object.assign(
					{},
					...styleArray.filter(Boolean),
				) as Record<string, unknown>;
			}
			return style as Record<string, unknown>;
		},
	},
}));

vi.mock("@/constants/typography", () => ({
	default: { FONT_FAMILY: "Rubik-SemiBold", APP_FONTS: {} },
}));

import applyAppFontStyle from "@/utils/appFontStyle";

describe("applyAppFontStyle", () => {
	afterEach(() => {
		mockPlatform.OS = "ios";
	});

	it("always applies the app's font family", () => {
		expect(applyAppFontStyle().fontFamily).toBe("Rubik-SemiBold");
	});

	it("keeps an explicit fontWeight on iOS", () => {
		mockPlatform.OS = "ios";

		const result = applyAppFontStyle({ fontWeight: "700" });

		expect(result.fontWeight).toBe("700");
	});

	it("strips fontWeight on Android (custom font already encodes weight)", () => {
		mockPlatform.OS = "android";

		const result = applyAppFontStyle({ fontWeight: "700" });

		expect(result.fontWeight).toBeUndefined();
		expect(result.fontFamily).toBe("Rubik-SemiBold");
	});

	it("merges an array of style objects like StyleSheet.flatten would", () => {
		const result = applyAppFontStyle([{ color: "red" }, { fontSize: 12 }]);

		expect(result).toMatchObject({
			color: "red",
			fontSize: 12,
			fontFamily: "Rubik-SemiBold",
		});
	});

	it("lets caller styles win over the base font family if provided", () => {
		const result = applyAppFontStyle({ fontFamily: "Custom-Font" });

		expect(result.fontFamily).toBe("Custom-Font");
	});
});
