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

import HomeScreen, {
	MODE_OPTIONS,
	SWIPE_DOWN_THRESHOLD,
	SWITCH_ARROW_TRAVEL,
	getModeLabel,
	getModeMenuOptions,
	getModeOptionState,
	getNextMode,
	getPressableScaleStyle,
	getSwitchDragProgress,
	getTileIconBackgroundColor,
	shouldCycleFromGesture,
} from "@/screens/HomeScreen";
import COLORS from "@/constants/colors";

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

	it("renders tools mode tiles and vault mode menu selection branches", () => {
		const navigation = { navigate: vi.fn() };
		const setMode = vi.fn();
		const setMenuVisible = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["TOOLS", setMode];
			if (call === 2) return [true, setMenuVisible];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = HomeScreen({ navigation } as any);

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());

		expect(navigation.navigate).toHaveBeenCalledWith("Notes");
		expect(navigation.navigate).toHaveBeenCalledWith("Todos");
		expect(setMode).toHaveBeenCalledWith("TOOLS");
		expect(setMode).toHaveBeenCalledWith("FINANCE");
		expect(setMode).toHaveBeenCalledWith("VAULT");
		expect(setMenuVisible).toHaveBeenCalledWith(false);
	});

	it("renders vault mode tiles", () => {
		const navigation = { navigate: vi.fn() };
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["VAULT", vi.fn()];
			if (call === 2) return [false, vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = HomeScreen({ navigation } as any);
		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());

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

	it("cycles mode on downward gesture and opens the mode menu on switch press", () => {
		const navigation = { navigate: vi.fn() };
		const setMode = vi.fn();
		const setMenuVisible = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["FINANCE", setMode];
			if (call === 2) return [false, setMenuVisible];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = HomeScreen({ navigation } as any);
		findByPredicate(
			tree,
			(node) => node?.props?.accessibilityLabel === "Switch homepage" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		gestureState.onEnd?.({ translationX: 0, translationY: 40 });

		expect(setMenuVisible).toHaveBeenCalledWith(true);
		expect(setMenuVisible).toHaveBeenCalledWith(false);
		expect(setMode).toHaveBeenCalled();
		const updater = setMode.mock.calls[0][0];
		expect(typeof updater).toBe("function");
		expect(updater("FINANCE")).toBe("VAULT");
		expect(updater("VAULT")).toBe("TOOLS");
	});

	it("renders the visible mode menu with selected option state", () => {
		const navigation = { navigate: vi.fn() };
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["VAULT", vi.fn()];
			if (call === 2) return [true, vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = HomeScreen({ navigation } as any);
		expect(
			findByPredicate(
				tree,
				(node) => String(JSON.stringify(node) ?? "").includes("Passwords"),
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) => String(JSON.stringify(node) ?? "").includes("checkmark-circle"),
			),
		).not.toHaveLength(0);
	});

	it("covers HomeScreen helper metadata directly", () => {
		expect(MODE_OPTIONS).toHaveLength(3);
		expect(getModeLabel("TOOLS")).toBe("Tools");
		expect(getModeLabel("FINANCE")).toBe("Finance");
		expect(getModeLabel("VAULT")).toBe("Vault");
		expect(getModeLabel("UNKNOWN" as any)).toBe("Tools");
		expect(getNextMode("TOOLS")).toBe("FINANCE");
		expect(getNextMode("FINANCE")).toBe("VAULT");
		expect(getNextMode("VAULT")).toBe("TOOLS");
		expect(getSwitchDragProgress(1, 40)).toBe(1);
		expect(getSwitchDragProgress(40, 1)).toBe(0);
		expect(shouldCycleFromGesture(1, 40)).toBe(true);
		expect(shouldCycleFromGesture(40, 20)).toBe(false);
		expect(getPressableScaleStyle(true)).toEqual([{ transform: [{ scale: 0.98 }] }]);
		expect(getPressableScaleStyle(false)).toEqual([false]);
		expect(getTileIconBackgroundColor("#123456")).toBe("#12345620");
		expect(getModeOptionState("VAULT", "VAULT")).toEqual({
			isSelected: true,
			iconColor: COLORS.primaryBright,
			showCheckmark: true,
			textColor: COLORS.primaryBright,
		});
		expect(getModeOptionState("TOOLS", "VAULT")).toEqual({
			isSelected: false,
			iconColor: COLORS.textMuted,
			showCheckmark: false,
			textColor: COLORS.text,
		});
		expect(getModeMenuOptions("FINANCE")).toEqual([
			{
				mode: "TOOLS",
				label: "Tools",
				icon: "construct-outline",
				iconColor: COLORS.textMuted,
				isSelected: false,
				showCheckmark: false,
			},
			{
				mode: "FINANCE",
				label: "Finance",
				icon: "wallet-outline",
				iconColor: COLORS.primaryBright,
				isSelected: true,
				showCheckmark: true,
			},
			{
				mode: "VAULT",
				label: "Vault",
				icon: "lock-closed-outline",
				iconColor: COLORS.textMuted,
				isSelected: false,
				showCheckmark: false,
			},
		]);
		expect(SWIPE_DOWN_THRESHOLD).toBe(28);
		expect(SWITCH_ARROW_TRAVEL).toBe(5);
	});

	it("handles modal close and mode option selection", () => {
		const navigation = { navigate: vi.fn() };
		const setMode = vi.fn();
		const setMenuVisible = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["FINANCE", setMode];
			if (call === 2) return [true, setMenuVisible];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = HomeScreen({ navigation } as any);
		findByPredicate(
			tree,
			(node) => node?.type === "Modal" && typeof node?.props?.onRequestClose === "function",
		)[0]?.props?.onRequestClose();

		const closers = findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function" && String(JSON.stringify(node) ?? "").includes("modeMenu") === false,
		);
		closers[0]?.props?.onPress();

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());

		expect(setMenuVisible).toHaveBeenCalledWith(false);
		expect(setMode).toHaveBeenCalled();
	});

	it("executes tile and switch style callbacks plus modal close callback", () => {
		const navigation = { navigate: vi.fn() };
		const setMenuVisible = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["FINANCE", vi.fn()];
			if (call === 2) return [true, setMenuVisible];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = HomeScreen({ navigation } as any);

		const tilePressables = findByPredicate(
			tree,
			(node) => typeof node?.props?.style === "function" && typeof node?.props?.onPress === "function",
		);
		const tileStyle = tilePressables[0]?.props?.style;
		expect(Array.isArray(tileStyle?.({ pressed: true }))).toBe(true);
		expect(Array.isArray(tileStyle?.({ pressed: false }))).toBe(true);

		const switchNode = findByPredicate(
			tree,
			(node) => node?.props?.accessibilityLabel === "Switch homepage" && typeof node?.props?.style === "function",
		)[0];
		expect(Array.isArray(switchNode?.props?.style({ pressed: true }))).toBe(true);
		expect(Array.isArray(switchNode?.props?.style({ pressed: false }))).toBe(true);

		const modalNode = findByPredicate(
			tree,
			(node) => typeof node?.props?.onRequestClose === "function",
		)[0];
		modalNode?.props?.onRequestClose();
		expect(typeof modalNode?.props?.onRequestClose).toBe("function");
	});
});
