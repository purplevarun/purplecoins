import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			// Specifying `include` reports every matching file (not just
			// ones a test happened to import), surfacing genuinely
			// untested modules instead of hiding them from the summary.
			include: ["src/**/*.ts"],
			exclude: [
				"src/**/*.test.ts",
				// Test-only infrastructure (in-memory DB harness, fixtures, mocks).
				"src/test/**",
				// Pure type declarations — no runtime logic to cover.
				"src/types/**",
				// UI layer: intentionally verified via the Maestro E2E suite
				// (see .maestro/) rather than unit tests, since rendering
				// React Native components requires native modules that
				// cannot run under Vitest's Node environment. See README.md.
				"src/components/**",
				"src/screens/**",
				"src/navigation/**",
				"src/providers/**",
				"src/hooks/**",
				// Does a Metro-only `require()` of a .ttf font asset at
				// module load time, which cannot resolve under Vitest.
				"src/constants/typography.ts",
			],
		},
	},
});

export default vitestConfig;
