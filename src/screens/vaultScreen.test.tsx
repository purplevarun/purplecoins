import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	deleteCard: vi.fn(),
	getCards: vi.fn(),
	deleteIdentity: vi.fn(),
	getIdentities: vi.fn(),
	deletePassword: vi.fn(),
	getPasswords: vi.fn(),
	setStringAsync: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
	confirm: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useEffect: reactMocks.useEffect,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("expo-clipboard", () => ({
	setStringAsync: serviceMocks.setStringAsync,
}));

vi.mock("react-native", () => ({
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/FloatingAddButton", () => ({
	default: (props: any) => ({ type: "FloatingAddButton", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/ListHeader", () => ({
	default: (props: any) => ({ type: "ListHeader", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: any) => ({ type: "ScreenList", props }),
}));
vi.mock("@/components/TextField", () => ({
	default: (props: any) => ({ type: "TextField", props }),
}));

vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm }),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, dataVersion: 1, refreshData: hookMocks.refreshData }),
}));

vi.mock("@/services/cardService", () => ({
	default: {
		deleteCard: serviceMocks.deleteCard,
		getCards: serviceMocks.getCards,
	},
}));
vi.mock("@/services/identityService", () => ({
	default: {
		deleteIdentity: serviceMocks.deleteIdentity,
		getIdentities: serviceMocks.getIdentities,
	},
}));
vi.mock("@/services/passwordService", () => ({
	default: {
		deletePassword: serviceMocks.deletePassword,
		getPasswords: serviceMocks.getPasswords,
	},
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: (value: number) => `date:${value}`,
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import VaultScreen from "@/screens/VaultScreen";

const flush = async (): Promise<void> => {
	await Promise.resolve();
	await Promise.resolve();
};

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

describe("VaultScreen", () => {
	beforeEach(() => {
		reactMocks.useEffect.mockReset();
		reactMocks.useState.mockReset();
		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			effect();
		});
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);

		Object.values(serviceMocks).forEach((mockFn) => mockFn.mockReset());
		Object.values(hookMocks).forEach((mockFn) => mockFn.mockReset());

		serviceMocks.getPasswords.mockResolvedValue([{ id: "p1" }]);
		serviceMocks.getCards.mockResolvedValue([{ id: "c1" }]);
		serviceMocks.getIdentities.mockResolvedValue([{ id: "i1" }]);
		serviceMocks.deletePassword.mockResolvedValue(undefined);
		serviceMocks.deleteCard.mockResolvedValue(undefined);
		serviceMocks.deleteIdentity.mockResolvedValue(undefined);
		serviceMocks.setStringAsync.mockResolvedValue(undefined);
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());
	});

	it("executes PASSWORD row copy/delete flows", async () => {
		const navigation = { navigate: vi.fn() };
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [[{ id: "p1", title: "Github", username: "u", website: "", password: "secret", updatedAt: 10 }], vi.fn()];
			}
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = VaultScreen({ navigation, route: { key: "k", name: "Vault", params: { kind: "PASSWORD" } } } as any);
		await flush();

		const screenList = findByPredicate(tree, (node) => typeof node?.props?.renderItem === "function")[0];
		const renderedItem = screenList.props.renderItem({
			item: {
				kind: "PASSWORD",
				entry: {
					id: "p1",
					title: "Github",
					username: "u",
					website: "",
					password: "secret",
					updatedAt: 10,
				},
			},
		});

		findByPredicate(
			renderedItem,
			(node) => node?.props?.label === "Copy password" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		findByPredicate(
			renderedItem,
			(node) => node?.props?.label === "Delete" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.setStringAsync).toHaveBeenCalledWith("secret");
		expect(serviceMocks.deletePassword).toHaveBeenCalledWith({ id: "db" }, "p1");
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("executes CARD and IDENTITY delete flows", async () => {
		const navigation = { navigate: vi.fn() };

		const cardTree = VaultScreen({
			navigation,
			route: { key: "c", name: "Vault", params: { kind: "CARD" } },
		} as any);
		await flush();
		const cardList = findByPredicate(cardTree, (node) => typeof node?.props?.renderItem === "function")[0];
		const cardItem = cardList.props.renderItem({
			item: {
				kind: "CARD",
				entry: {
					id: "c1",
					name: "Visa",
					cardType: "CREDIT_CARD",
					cardNumber: "1111",
					expiry: "12/30",
					cvv: "111",
					pin: "0000",
					network: "VISA",
					hasAttachment: true,
				},
			},
		});
		findByPredicate(
			cardItem,
			(node) => node?.props?.label === "Delete" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const identityTree = VaultScreen({
			navigation,
			route: { key: "i", name: "Vault", params: { kind: "IDENTITY" } },
		} as any);
		await flush();
		const identityList = findByPredicate(identityTree, (node) => typeof node?.props?.renderItem === "function")[0];
		const identityItem = identityList.props.renderItem({
			item: {
				kind: "IDENTITY",
				entry: {
					id: "i1",
					title: "Passport",
					idNumber: "P1",
					hasAttachment: false,
				},
			},
		});
		findByPredicate(
			identityItem,
			(node) => node?.props?.label === "Delete" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.deleteCard).toHaveBeenCalledWith({ id: "db" }, "c1");
		expect(serviceMocks.deleteIdentity).toHaveBeenCalledWith({ id: "db" }, "i1");
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});
});
