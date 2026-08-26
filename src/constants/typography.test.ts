import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const nodeRequire = createRequire(import.meta.url);

describe("typography", () => {
	it("exposes font family and font asset map", async () => {
		nodeRequire.extensions[".ttf"] = (module: { exports: unknown }) => {
			module.exports = 123;
		};

		const typographyModule = await import("@/constants/typography");
		expect(typographyModule.default.FONT_FAMILY).toBe("Rubik-SemiBold");
		expect(typographyModule.default.APP_FONTS).toEqual({
			"Rubik-SemiBold": 123,
		});
	});
});
