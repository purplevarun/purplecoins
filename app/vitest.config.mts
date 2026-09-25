import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
	resolve: {
		alias: {
			"@test": fileURLToPath(new URL("./test", import.meta.url)),
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.d.ts", "src/App.tsx", "src/index.ts"],
			thresholds: {
				branches: 100,
				functions: 100,
				lines: 100,
				statements: 100,
			},
		},
	},
});

export default vitestConfig;
