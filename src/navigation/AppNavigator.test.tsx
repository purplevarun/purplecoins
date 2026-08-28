import { describe, expect, it, vi } from "vitest";

vi.mock("@/constants/typography", () => ({
	default: {
		FONT_FAMILY: "Rubik-SemiBold",
	},
}));

vi.mock("@react-navigation/native", () => ({
	DarkTheme: {
		colors: {
			background: "dark-bg",
			card: "dark-card",
			border: "dark-border",
			primary: "dark-primary",
			text: "dark-text",
		},
	},
	NavigationContainer: "NavigationContainer",
}));

vi.mock("@react-navigation/native-stack", () => ({
	createNativeStackNavigator: () => ({
		Navigator: "Navigator",
		Screen: "Screen",
	}),
}));

vi.mock("@/utils/relation", () => ({
	default: vi.fn((kind: string) => ({ title: `${kind} TITLE` })),
}));

vi.mock("@/screens/AnalysisScreen", () => ({ default: "AnalysisScreen" }));
vi.mock("@/screens/ArchivedRelationsScreen", () => ({
	default: "ArchivedRelationsScreen",
}));
vi.mock("@/screens/BudgetFormScreen", () => ({ default: "BudgetFormScreen" }));
vi.mock("@/screens/BudgetsScreen", () => ({ default: "BudgetsScreen" }));
vi.mock("@/screens/ExchangeRatesScreen", () => ({
	default: "ExchangeRatesScreen",
}));
vi.mock("@/screens/GlobalSearchScreen", () => ({
	default: "GlobalSearchScreen",
}));
vi.mock("@/screens/HomeScreen", () => ({ default: "HomeScreen" }));
vi.mock("@/screens/LinkedTransactionsScreen", () => ({
	default: "LinkedTransactionsScreen",
}));
vi.mock("@/screens/NoteFormScreen", () => ({ default: "NoteFormScreen" }));
vi.mock("@/screens/NotesScreen", () => ({ default: "NotesScreen" }));
vi.mock("@/screens/RelationFormScreen", () => ({
	default: "RelationFormScreen",
}));
vi.mock("@/screens/RelationsScreen", () => ({ default: "RelationsScreen" }));
vi.mock("@/screens/SettingsScreen", () => ({ default: "SettingsScreen" }));
vi.mock("@/screens/TodoFormScreen", () => ({ default: "TodoFormScreen" }));
vi.mock("@/screens/TodosScreen", () => ({ default: "TodosScreen" }));
vi.mock("@/screens/TransactionFormScreen", () => ({
	default: "TransactionFormScreen",
}));
vi.mock("@/screens/TransactionsScreen", () => ({
	default: "TransactionsScreen",
}));
vi.mock("@/screens/VaultFormScreen", () => ({ default: "VaultFormScreen" }));
vi.mock("@/screens/VaultScreen", () => ({ default: "VaultScreen" }));

import AppNavigator from "@/navigation/AppNavigator";

const findAllByType = (node: any, type: string, acc: any[] = []): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findAllByType(child, type, acc));
		return acc;
	}
	if (node.type === type) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			findAllByType(value, type, acc),
		);
	}
	return acc;
};

describe("AppNavigator", () => {
	it("wires screens, theme, and dynamic title options", () => {
		const tree = AppNavigator();
		const containers = findAllByType(tree, "NavigationContainer");
		expect(containers).toHaveLength(1);
		expect(containers[0]?.props?.theme?.colors?.background).toBe("#080B14");

		const navigators = findAllByType(tree, "Navigator");
		expect(navigators).toHaveLength(1);
		expect(navigators[0]?.props?.initialRouteName).toBe("Home");
		expect(
			navigators[0]?.props?.screenOptions?.headerTitleStyle?.fontFamily,
		).toBe("Rubik-SemiBold");

		const screens = findAllByType(tree, "Screen");
		expect(screens).toHaveLength(19);

		const byName = (name: string) =>
			screens.find((screen) => screen?.props?.name === name);

		expect(byName("Transactions")?.props?.options?.title).toBe(
			"Transactions",
		);
		expect(
			byName("Relations")?.props?.options({
				route: { params: { kind: "CATEGORY" } },
			}).title,
		).toBe("CATEGORY TITLE");
		expect(
			byName("LinkedTransactions")?.props?.options({
				route: { params: { entityName: "Rent" } },
			}).title,
		).toBe("Rent");
		expect(
			byName("GlobalSearch")?.props?.options({
				route: { params: { mode: "TODO" } },
			}).title,
		).toBe("Search Todo");
		expect(
			byName("Vault")?.props?.options({
				route: { params: { kind: "IDENTITY" } },
			}).title,
		).toBe("Identity");
		expect(
			byName("Vault")?.props?.options({
				route: { params: { kind: "PASSWORD" } },
			}).title,
		).toBe("Passwords");
	});
});
