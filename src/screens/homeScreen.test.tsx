import { beforeEach, describe, expect, it, vi } from "vitest";

const gestureState = vi.hoisted(() => ({
	onUpdate: null as null | ((event: any) => void),
	onEnd: null as null | ((event: any) => void),
	onFinalize: null as null | (() => void),
}));

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const animatedMocks = vi.hoisted(() => ({
	Value: class {
		value: number;
		constructor(initial: number) {
			this.value = initial;
		}
		setValue(next: number): void {
			this.value = next;
		}
		interpolate(): number {
			return this.value;
		}
	},
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useCallback: reactMocks.useCallback,
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
	Animated: {
		Value: animatedMocks.Value,
		spring: () => ({ start: vi.fn() }),
		View: (props: any) => ({ type: "Animated.View", props }),
	},
	Modal: (props: any) => ({ type: "Modal", props }),
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("react-native-gesture-handler", () => ({
	Gesture: {
		Pan: () => {
			const chain = {
				enabled: () => chain,
				minDistance: () => chain,
				runOnJS: () => chain,
				onUpdate: (fn: (event: any) => void) => {
					gestureState.onUpdate = fn;
					return chain;
				},
				onEnd: (fn: (event: any) => void) => {
					gestureState.onEnd = fn;
					return chain;
				},
				onFinalize: (fn: () => void) => {
					gestureState.onFinalize = fn;
					return chain;
				},
			};
			return chain;
		},
	},
	GestureDetector: (props: any) => ({ type: "GestureDetector", props }),
}));

vi.mock("react-native-safe-area-context", () => ({
	SafeAreaView: (props: any) => ({ type: "SafeAreaView", props }),
}));

vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
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

import HomeScreen from "@/screens/HomeScreen";

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
		gestureState.onUpdate = null;
		gestureState.onEnd = null;
		gestureState.onFinalize = null;
		reactMocks.useState.mockReset();
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);
	});

	it("renders finance tiles and triggers key navigation actions", () => {
		const navigation = { navigate: vi.fn() };
		const tree = HomeScreen({ navigation } as any);

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

		gestureState.onUpdate?.({ translationX: 2, translationY: 40 });
		gestureState.onEnd?.({ translationX: 2, translationY: 40 });
		gestureState.onFinalize?.();

		expect(navigation.navigate).toHaveBeenCalledWith("GlobalSearch", { mode: "FINANCE" });
		expect(navigation.navigate).toHaveBeenCalledWith("Settings");
		expect(navigation.navigate).toHaveBeenCalledWith("Transactions");
		expect(navigation.navigate).toHaveBeenCalledWith("Relations", { kind: "SOURCE" });
		expect(navigation.navigate).toHaveBeenCalledWith("Budgets");
		expect(navigation.navigate).toHaveBeenCalledWith("Analysis");
		expect(navigation.navigate).toHaveBeenCalledWith("ExchangeRates");
	});
});
