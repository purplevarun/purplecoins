import { describe, expect, it, vi } from "vitest";

const applyAppFontStyleMock = vi.hoisted(() => vi.fn((style) => style ?? {}));

vi.mock("@/utils/appFontStyle", () => ({
	default: applyAppFontStyleMock,
}));

vi.mock("react-native", () => ({
	ActivityIndicator: "ActivityIndicator",
	KeyboardAvoidingView: "KeyboardAvoidingView",
	Platform: { OS: "ios" },
	Pressable: "Pressable",
	ScrollView: "ScrollView",
	StyleSheet: {
		absoluteFill: {},
		create: (styles: unknown) => styles,
		flatten: (style: unknown) => style ?? {},
	},
	Text: "Text",
	TextInput: "TextInput",
	View: "View",
}));

vi.mock("@expo/vector-icons", () => ({
	Ionicons: "Ionicons",
}));

vi.mock("expo-linear-gradient", () => ({
	LinearGradient: "LinearGradient",
}));

vi.mock("expo-blur", () => ({
	BlurView: "BlurView",
}));

vi.mock("react-native-safe-area-context", () => ({
	SafeAreaView: "SafeAreaView",
}));

vi.mock("@shopify/flash-list", () => ({
	FlashList: "FlashList",
}));

import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/CustomTextInput";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import HeaderIconButton from "@/components/HeaderIconButton";
import ListHeader from "@/components/ListHeader";
import LoadingScreen from "@/components/LoadingScreen";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenList from "@/components/ScreenList";
import SearchBar from "@/components/SearchBar";
import SectionHeading from "@/components/SectionHeading";

import { Platform } from "react-native";

const findFirstByType = (node: any, type: string): any => {
	if (!node) return null;
	if (Array.isArray(node)) {
		for (const child of node) {
			const result = findFirstByType(child, type);
			if (result) return result;
		}
		return null;
	}
	if (node.type === type) return node;
	if (!node.props) return null;
	for (const value of Object.values(node.props)) {
		const result = findFirstByType(value, type);
		if (result) return result;
	}
	return null;
};

describe("presentational components", () => {
	it("renders CustomText and CustomTextInput with app font styles", () => {
		const textElement = CustomText({ style: { fontSize: 16 }, children: "Hi" } as any);
		expect(textElement.type).toBe("Text");
		expect(applyAppFontStyleMock).toHaveBeenCalledWith({ fontSize: 16 });

		const inputElement = CustomTextInput({ style: { fontSize: 14 }, value: "x" } as any);
		expect(inputElement.type).toBe("TextInput");
		expect(applyAppFontStyleMock).toHaveBeenCalledWith({ fontSize: 14 });
	});

	it("renders EmptyState, ListHeader, and SectionHeading branches", () => {
		const empty = EmptyState({ icon: "search", title: "None", message: "Nothing here" } as any);
		expect(empty.type).toBe("View");
		expect(findFirstByType(empty, "Ionicons")?.props.name).toBe("search");

		const header = ListHeader({ children: "Body" } as any);
		expect(header.type).toBe("View");
		expect(header.props.children).toBe("Body");

		const headingWithSubtitle = SectionHeading({ title: "Title", subtitle: "Sub" } as any);
		expect(findFirstByType(headingWithSubtitle, "View")).toBeTruthy();
		const headingWithoutSubtitle = SectionHeading({ title: "Title" } as any);
		expect(findFirstByType(headingWithoutSubtitle, "View")).toBeTruthy();
	});

	it("renders loading and error branches in LoadingScreen", () => {
		const loading = LoadingScreen({ error: null } as any);
		expect(findFirstByType(loading, "ActivityIndicator")).toBeTruthy();

		const error = LoadingScreen({ error: "DB failed" } as any);
		expect(findFirstByType(error, "ActivityIndicator")).toBeNull();
	});

	it("renders Notice tones and SearchBar defaults", () => {
		expect(findFirstByType(Notice({ message: "Info" } as any), "Ionicons")?.props.name).toBe(
			"information-circle",
		);
		expect(
			findFirstByType(Notice({ message: "Warn", tone: "warning" } as any), "Ionicons")?.props.name,
		).toBe("information-circle");
		expect(
			findFirstByType(Notice({ message: "Danger", tone: "danger" } as any), "Ionicons")?.props.name,
		).toBe("alert-circle");

		const searchDefault = SearchBar({ value: "", onChangeText: vi.fn() } as any);
		const defaultInput = findFirstByType(searchDefault, CustomTextInput as any);
		expect(defaultInput?.props.placeholder).toBe("Search...");
		expect(defaultInput?.props.autoFocus).toBe(true);

		const searchCustom = SearchBar({
			value: "a",
			onChangeText: vi.fn(),
			placeholder: "Find",
			autoFocus: false,
		} as any);
		const customInput = findFirstByType(searchCustom, CustomTextInput as any);
		expect(customInput?.props.placeholder).toBe("Find");
		expect(customInput?.props.autoFocus).toBe(false);
	});

	it("covers FloatingAddButton and HeaderIconButton style branches", () => {
		const onPress = vi.fn();
		const fab = FloatingAddButton({ onPress } as any);
		expect(fab.type).toBe("Pressable");
		expect(fab.props.accessibilityLabel).toBe("Add");
		expect(fab.props.style({ pressed: false })[1]).toBe(false);
		expect(fab.props.style({ pressed: true })[1]).toBeTruthy();

		const inactive = HeaderIconButton({
			icon: "search-outline",
			onPress,
			accessibilityLabel: "Search",
		} as any);
		expect(inactive.props.style({ pressed: false })[1]).toBe(false);
		expect(inactive.props.style({ pressed: true })[2]).toBeTruthy();

		const active = HeaderIconButton({
			icon: "search-outline",
			onPress,
			isActive: true,
			accessibilityLabel: "Search",
		} as any);
		expect(active.props.style({ pressed: false })[1]).toBeTruthy();
	});

	it("covers GlassCard accent variants", () => {
		const success = GlassCard({ accent: "success", children: "x" } as any) as any;
		expect(success.props.style[1].borderColor).toBeTruthy();
		const danger = GlassCard({ accent: "danger", children: "x" } as any) as any;
		expect(danger.props.style[1].borderColor).toBeTruthy();
		const warning = GlassCard({ accent: "warning", children: "x" } as any) as any;
		expect(warning.props.style[1].borderColor).toBeTruthy();
		const defaultCard = GlassCard({ children: "x" } as any) as any;
		expect(defaultCard.props.style[1].borderColor).toBeTruthy();
	});

	it("covers ScreenContainer and ScreenList branches", () => {
		(Platform as { OS: string }).OS = "ios";
		const scrollable = ScreenContainer({ children: "x", isScrollable: true } as any) as any;
		const keyboardViewA = findFirstByType(scrollable, "KeyboardAvoidingView");
		expect(keyboardViewA.props.behavior).toBe("padding");
		expect(findFirstByType(scrollable, "ScrollView")).toBeTruthy();

		(Platform as { OS: string }).OS = "android";
		const staticContainer = ScreenContainer({ children: "x", isScrollable: false } as any) as any;
		const keyboardViewB = findFirstByType(staticContainer, "KeyboardAvoidingView");
		expect(keyboardViewB.props.behavior).toBeUndefined();
		expect(findFirstByType(staticContainer, "ScrollView")).toBeNull();

		const defaultList = ScreenList({ data: [], renderItem: vi.fn() } as any) as any;
		const flashListDefault = findFirstByType(defaultList, "FlashList");
		expect(flashListDefault.props.ItemSeparatorComponent).toBeTruthy();
		const defaultSeparator = flashListDefault.props.ItemSeparatorComponent();
		expect(defaultSeparator).toBeTruthy();

		const customSeparator = () => null;
		const customList = ScreenList({
			data: [],
			renderItem: vi.fn(),
			ItemSeparatorComponent: customSeparator,
		} as any) as any;
		const flashListCustom = findFirstByType(customList, "FlashList");
		expect(flashListCustom.props.ItemSeparatorComponent).toBe(customSeparator);
	});
});
