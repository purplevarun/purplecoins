import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("expo-linear-gradient", () => ({
	LinearGradient: (props: any) => ({ type: "LinearGradient", props }),
}));

vi.mock("react-native", () => ({
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("react-native-safe-area-context", () => ({
	SafeAreaView: (props: any) => ({ type: "SafeAreaView", props }),
}));

vi.mock("@/components/BottomNavBar", () => ({
	default: (props: any) => ({ type: "BottomNavBar", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/HeaderIconButton", () => ({
	default: (props: any) => ({ type: "HeaderIconButton", props }),
}));
vi.mock("@/components/ScreenContainer", () => ({
	default: (props: any) => ({ type: "ScreenContainer", props }),
}));

import HomeScreen, {
	MODE_OPTIONS,
	getModeLabel,
	getPressableScaleStyle,
	getTileIconBackgroundColor,
} from "@/screens/HomeScreen";

const findByPredicate = (
	node: any,
	predicate: (candidate: any) => boolean,
	acc: any[] = [],
): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findByPredicate(child, predicate, acc));
		return acc;
	}
	if (predicate(node)) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			findByPredicate(value, predicate, acc),
		);
	}
	return acc;
};

describe("HomeScreen", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);
	});

	it("renders finance tiles and triggers key navigation actions", () => {
		const navigation = { navigate: vi.fn() };
		const tree = HomeScreen({ navigation } as any);

		const tilePressable = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.style === "function" &&
				typeof node?.props?.onPress === "function",
		)[0];
		expect(tilePressable).toBeTruthy();
		expect(tilePressable.props.style({ pressed: true })).toEqual(
			expect.arrayContaining([expect.anything()]),
		);

		const headerButtons = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				typeof node?.props?.accessibilityLabel === "string" &&
				(node.props.accessibilityLabel.includes("Search") ||
					node.props.accessibilityLabel === "Settings"),
		);
		headerButtons.forEach((button) => button.props.onPress());

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((pressable) => pressable.props.onPress());

		expect(navigation.navigate).toHaveBeenCalledWith("GlobalSearch");
		expect(navigation.navigate).toHaveBeenCalledWith("Settings");
		expect(navigation.navigate).toHaveBeenCalledWith("Transactions");
		expect(navigation.navigate).toHaveBeenCalledWith("Sources");
		expect(navigation.navigate).toHaveBeenCalledWith("Categories");
		expect(navigation.navigate).toHaveBeenCalledWith("Analysis");
		expect(navigation.navigate).not.toHaveBeenCalledWith("Budgets");
		expect(navigation.navigate).not.toHaveBeenCalledWith("ExchangeRates");
		expect(JSON.stringify(tree)).not.toContain("Budgets");
		expect(JSON.stringify(tree)).not.toContain("Exchange rates");
	});

	it("renders tools mode tiles including vault and documents entries", () => {
		const navigation = { navigate: vi.fn() };
		reactMocks.useState.mockImplementation(() => ["TOOLS", vi.fn()]);

		const tree = HomeScreen({ navigation } as any);

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());

		expect(navigation.navigate).toHaveBeenCalledWith("Notes");
		expect(navigation.navigate).toHaveBeenCalledWith("Todos");
		expect(navigation.navigate).toHaveBeenCalledWith("Documents");
		expect(navigation.navigate).toHaveBeenCalledWith("Vault", {
			kind: "PASSWORD",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("Vault", {
			kind: "CARD",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("Vault", {
			kind: "IDENTITY",
		});
	});

	it("renders health mode as a coming soon state", () => {
		const navigation = { navigate: vi.fn() };
		reactMocks.useState.mockImplementation(() => ["HEALTH", vi.fn()]);

		const tree = HomeScreen({ navigation } as any);

		const comingSoon = findByPredicate(
			tree,
			(node) => node?.props?.title === "Coming soon",
		);
		expect(comingSoon).not.toHaveLength(0);
		expect(comingSoon[0].props.icon).toBe("fitness-outline");

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());
		expect(navigation.navigate).toHaveBeenCalledWith("GlobalSearch");
		expect(navigation.navigate).toHaveBeenCalledWith("Settings");
	});

	it("passes mode state to the bottom nav and applies selection", () => {
		const navigation = { navigate: vi.fn() };
		const setMode = vi.fn();
		reactMocks.useState.mockImplementation(() => ["FINANCE", setMode]);

		const tree = HomeScreen({ navigation } as any);
		const navBar = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onSelectMode === "function" &&
				Array.isArray(node?.props?.options),
		)[0];

		expect(navBar).toBeTruthy();
		expect(navBar.props.activeMode).toBe("FINANCE");
		expect(navBar.props.options).toEqual(MODE_OPTIONS);

		navBar.props.onSelectMode("HEALTH");
		expect(setMode).toHaveBeenCalledWith("HEALTH");
	});

	it("executes tile style callbacks", () => {
		const navigation = { navigate: vi.fn() };
		const tree = HomeScreen({ navigation } as any);

		const styledPressables = findByPredicate(
			tree,
			(node) => typeof node?.props?.style === "function",
		);
		expect(styledPressables.length).toBeGreaterThan(0);
		styledPressables.forEach((node) => {
			expect(Array.isArray(node.props.style({ pressed: true }))).toBe(
				true,
			);
			expect(Array.isArray(node.props.style({ pressed: false }))).toBe(
				true,
			);
		});
	});

	it("covers HomeScreen helper metadata directly", () => {
		expect(MODE_OPTIONS).toHaveLength(3);
		expect(getModeLabel("TOOLS")).toBe("Tools");
		expect(getModeLabel("FINANCE")).toBe("Finance");
		expect(getModeLabel("HEALTH")).toBe("Health");
		expect(getModeLabel("UNKNOWN" as any)).toBe("Tools");
		expect(getPressableScaleStyle(true)).toEqual([
			{ transform: [{ scale: 0.98 }] },
		]);
		expect(getPressableScaleStyle(false)).toEqual([false]);
		expect(getTileIconBackgroundColor("#123456")).toBe("#12345620");
	});
});
