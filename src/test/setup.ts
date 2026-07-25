import { vi } from "vitest";

/**
 * Global Vitest setup.
 *
 * `expo-crypto` transitively pulls in `react-native`'s entry point, which
 * uses Flow syntax that Vitest's esbuild/rolldown transform cannot parse.
 * Virtually every write-path service calls `@/utils/id` (a thin wrapper
 * around `expo-crypto`'s `randomUUID`), so rather than repeating this mock
 * in every service test file, it is registered once, globally, here.
 *
 * IDs are deterministic-but-unique (an incrementing counter) so tests can
 * assert things like "a new id was generated" without needing real
 * randomness.
 */
let uuidCounter = 0;

vi.mock("expo-crypto", () => ({
	randomUUID: (): string => {
		uuidCounter += 1;
		return `00000000-mock-uuid-0000-${uuidCounter.toString().padStart(12, "0")}`;
	},
}));
