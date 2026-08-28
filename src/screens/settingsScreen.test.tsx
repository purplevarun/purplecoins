import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn(),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	exportBackup: vi.fn(),
	restoreBackup: vi.fn(),
	getDefaultTripId: vi.fn(),
	getFyStartMonth: vi.fn(),
	getNativeCurrencyDisplay: vi.fn(),
	updateDefaultTripId: vi.fn(),
	updateFyStartMonth: vi.fn(),
	updateNativeCurrencyDisplay: vi.fn(),
	getTrips: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
	confirm: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useEffect: reactMocks.useEffect,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	Switch: (props: any) => ({ type: "Switch", props }),
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenContainer", () => ({
	default: (props: any) => ({ type: "ScreenContainer", props }),
}));
vi.mock("@/components/SelectField", () => ({
	default: (props: any) => ({ type: "SelectField", props }),
}));

vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm }),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({
		database: { id: "db" },
		refreshData: hookMocks.refreshData,
	}),
}));

vi.mock("@/services/backupService", () => ({
	default: {
		exportBackup: serviceMocks.exportBackup,
		restoreBackup: serviceMocks.restoreBackup,
	},
}));
vi.mock("@/services/settingsService", () => ({
	default: {
		getDefaultTripId: serviceMocks.getDefaultTripId,
		getFyStartMonth: serviceMocks.getFyStartMonth,
		getNativeCurrencyDisplay: serviceMocks.getNativeCurrencyDisplay,
		updateDefaultTripId: serviceMocks.updateDefaultTripId,
		updateFyStartMonth: serviceMocks.updateFyStartMonth,
		updateNativeCurrencyDisplay: serviceMocks.updateNativeCurrencyDisplay,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: {
		getTrips: serviceMocks.getTrips,
	},
}));

vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));

import SettingsScreen from "@/screens/SettingsScreen";

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

describe("SettingsScreen", () => {
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

		serviceMocks.getNativeCurrencyDisplay.mockResolvedValue(true);
		serviceMocks.getFyStartMonth.mockResolvedValue(4);
		serviceMocks.getDefaultTripId.mockResolvedValue("trip1");
		serviceMocks.getTrips.mockResolvedValue([{ id: "trip1", name: "Goa" }]);
		serviceMocks.updateNativeCurrencyDisplay.mockResolvedValue(undefined);
		serviceMocks.updateFyStartMonth.mockResolvedValue(undefined);
		serviceMocks.updateDefaultTripId.mockResolvedValue(undefined);
		serviceMocks.exportBackup.mockResolvedValue(undefined);
		serviceMocks.restoreBackup.mockResolvedValue(true);
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
	});

	it("loads settings and executes configuration and backup actions", async () => {
		const navigation = { navigate: vi.fn() };
		const tree = SettingsScreen({ navigation } as any);
		await flush();

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onValueChange === "function",
		)[0]?.props?.onValueChange(false);
		await flush();

		const selects = findByPredicate(
			tree,
			(node) => typeof node?.props?.onChange === "function",
		);
		selects
			.find((node) => node?.props?.label === "Financial year start month")
			?.props?.onChange("7");
		selects
			.find((node) => node?.props?.label === "Default trip")
			?.props?.onChange("trip1");
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Archived relations" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Export .purplecoins" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Restore .purplecoins" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getNativeCurrencyDisplay).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.getFyStartMonth).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getDefaultTripId).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.getTrips).toHaveBeenCalledWith({ id: "db" });

		expect(serviceMocks.updateNativeCurrencyDisplay).toHaveBeenCalledWith(
			{ id: "db" },
			false,
		);
		expect(serviceMocks.updateFyStartMonth).toHaveBeenCalledWith(
			{ id: "db" },
			7,
		);
		expect(serviceMocks.updateDefaultTripId).toHaveBeenCalledWith(
			{ id: "db" },
			"trip1",
		);
		expect(serviceMocks.exportBackup).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.restoreBackup).toHaveBeenCalledWith({ id: "db" });
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalledWith("ArchivedRelations");
	});

	it("handles restore no-op branch when no backup was restored", async () => {
		serviceMocks.restoreBackup.mockResolvedValue(false);
		const tree = SettingsScreen({
			navigation: { navigate: vi.fn() },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Restore .purplecoins" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.restoreBackup).toHaveBeenCalledWith({ id: "db" });
	});

	it("covers export and restore error branches", async () => {
		serviceMocks.exportBackup.mockRejectedValueOnce(
			new Error("export failed"),
		);
		serviceMocks.restoreBackup.mockRejectedValueOnce(
			new Error("restore failed"),
		);
		const tree = SettingsScreen({
			navigation: { navigate: vi.fn() },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Export .purplecoins" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Restore .purplecoins" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.exportBackup).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.restoreBackup).toHaveBeenCalledWith({ id: "db" });
	});

	it("covers null default trip load and empty default trip update", async () => {
		serviceMocks.getDefaultTripId.mockResolvedValue(null);
		const tree = SettingsScreen({
			navigation: { navigate: vi.fn() },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Default trip" &&
				typeof node?.props?.onChange === "function",
		)[0]?.props?.onChange("");
		await flush();

		expect(serviceMocks.getDefaultTripId).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.updateDefaultTripId).toHaveBeenCalledWith(
			{ id: "db" },
			null,
		);
	});

	it("covers FY-end label branches and mapped trip options", async () => {
		const navigation = { navigate: vi.fn() };
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 5) return [1, vi.fn()];
			if (call === 7) {
				return [
					[
						{ id: "trip1", name: "Goa" },
						{ id: "trip2", name: "Mysore" },
					],
					vi.fn(),
				];
			}
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = SettingsScreen({ navigation } as any);
		await flush();

		expect(String(JSON.stringify(tree) ?? "")).toContain("Dec");
		const defaultTripSelect = findByPredicate(
			tree,
			(node) => node?.props?.label === "Default trip",
		)[0];
		expect(defaultTripSelect?.props?.options).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ value: "" }),
				expect.objectContaining({ value: "trip1" }),
				expect.objectContaining({ value: "trip2" }),
			]),
		);
	});

	it("covers FY-end fallback label", async () => {
		const navigation = { navigate: vi.fn() };
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 5) return [0, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = SettingsScreen({ navigation } as any);
		await flush();

		expect(String(JSON.stringify(tree) ?? "")).toContain("Mar");
	});

	it("renders message and error notices", async () => {
		const navigation = { navigate: vi.fn() };
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 3) return ["boom", vi.fn()];
			if (call === 4) return ["saved", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = SettingsScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(tree, (node) => node?.props?.message === "saved"),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) =>
					node?.props?.message === "boom" &&
					node?.props?.tone === "danger",
			),
		).not.toHaveLength(0);
	});
});
