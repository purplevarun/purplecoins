import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Decimal from "decimal.js";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import HeaderIconButton from "@/components/HeaderIconButton";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import SearchBar from "@/components/SearchBar";
import SegmentedControl from "@/components/SegmentedControl";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import analysisService from "@/services/analysisService";
import categoryService from "@/services/categoryService";
import exchangeRateService from "@/services/exchangeRateService";
import settingsService from "@/services/settingsService";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type CategoriesScreenProps from "@/types/CategoriesScreenProps";
import type Category from "@/types/Category";
import type ExchangeRate from "@/types/ExchangeRate";
import type SelectOption from "@/types/SelectOption";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
const { getAnalysisSummary } = analysisService;
const { getCategories, setCategoryArchived } = categoryService;
const { getExchangeRates } = exchangeRateService;
const { getNativeCurrencyDisplay } = settingsService;
const { compareMoney, formatMoney, ZERO_AMOUNT } = moneyUtils;

const CATEGORY_FILTER_OPTIONS: readonly SelectOption[] = [
	{ label: "All", value: "ALL" },
	{ label: "Expense", value: "EXPENSE" },
	{ label: "Income", value: "INCOME" },
];

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;

const CategoriesScreen = ({
	navigation,
}: CategoriesScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [exchangeRates, setExchangeRates] = useState<readonly ExchangeRate[]>(
		[],
	);
	const [error, setError] = useState("");
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setError("");
			const [nativeCurrency, loadedRates] = await Promise.all([
				getNativeCurrencyDisplay(database),
				getExchangeRates(database),
			]);
			setIsNativeCurrency(nativeCurrency);
			setExchangeRates(loadedRates);
			const [loadedCategories, loadedAnalysis] = await Promise.all([
				getCategories(
					database,
					categoryFilter === "ALL"
						? undefined
						: categoryFilter === "INCOME",
				),
				getAnalysisSummary(database, {
					dateRange: { start: ALL_TIME_START, end: ALL_TIME_END },
					isNativeCurrency: nativeCurrency,
				}),
			]);
			setCategories(loadedCategories);
			setAnalysis(loadedAnalysis);
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [categoryFilter, database]);

	useFocusEffect(
		useCallback(() => {
			void getScreenData();
		}, [getScreenData]),
	);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={styles.headerActions}>
					<HeaderIconButton
						accessibilityLabel={
							searchVisible ? "Close search" : "Search"
						}
						icon={
							searchVisible ? "close-outline" : "search-outline"
						}
						isActive={searchVisible}
						onPress={() => {
							setSearchVisible((visible) => !visible);
							setSearchQuery("");
							setSearchDebounced("");
						}}
					/>
					<HeaderIconButton
						accessibilityLabel="Budgets"
						icon="speedometer-outline"
						onPress={() => navigation.navigate("Budgets")}
					/>
				</View>
			),
		});
	}, [navigation, searchVisible]);

	const handleArchive = useCallback(
		async (id: string): Promise<void> => {
			try {
				await setCategoryArchived(database, id, true);
				refreshData();
				await getScreenData();
			} catch (caughtError: unknown) {
				dialog.showMessage({
					title: "Unable to archive",
					message: getErrorMessage(caughtError),
					variant: "danger",
				});
			}
		},
		[database, dialog, getScreenData, refreshData],
	);

	const handleArchivePress = useCallback(
		(id: string, name: string): void => {
			dialog.confirm({
				title: `Archive "${name}"?`,
				message:
					"It will be hidden from lists and dropdowns everywhere. You can restore it anytime from Settings \u2192 Archived relations.",
				confirmLabel: "Archive",
				variant: "danger",
				onConfirm: () => void handleArchive(id),
			});
		},
		[dialog, handleArchive],
	);

	const rateMap = useMemo((): Map<string, Decimal> => {
		const map = new Map<string, Decimal>();
		for (const rate of exchangeRates) {
			map.set(rate.currencyCode, new Decimal(rate.rateToInr));
		}
		map.set("INR", new Decimal(1));
		return map;
	}, [exchangeRates]);

	const toInr = useCallback(
		(amount: string, currencyCode: string): Decimal => {
			const rate = rateMap.get(currencyCode);
			if (!rate) return new Decimal(0);
			return new Decimal(amount).times(rate);
		},
		[rateMap],
	);

	const listData = useMemo(
		() =>
			[...categories].sort((a, b) => {
				const netA = (analysis?.categories ?? [])
					.filter((row) => row.categoryId === a.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.net, row.currencyCode)),
						new Decimal(0),
					);
				const netB = (analysis?.categories ?? [])
					.filter((row) => row.categoryId === b.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.net, row.currencyCode)),
						new Decimal(0),
					);
				return netA.comparedTo(netB);
			}),
		[analysis, categories, toInr],
	);

	const filteredListData = useMemo(() => {
		if (!searchDebounced.trim()) return listData;
		const q = searchDebounced.trim().toLowerCase();
		return listData.filter((category) =>
			category.name.toLowerCase().includes(q),
		);
	}, [listData, searchDebounced]);

	const renderCategoryItem = useCallback(
		({ item: category }: { item: Category }): React.JSX.Element => {
			const totals =
				analysis?.categories.filter(
					(row) => row.categoryId === category.id,
				) ?? [];
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: "CATEGORY",
							entityId: category.id,
							entityName: category.name,
						})
					}
				>
					<GlassCard
						accent={category.isIncome ? "success" : "default"}
					>
						<View style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									color={
										category.isIncome
											? COLORS.success
											: COLORS.warning
									}
									name={
										category.isIncome
											? "arrow-down-circle-outline"
											: "pricetag-outline"
									}
									size={22}
								/>
							</View>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{category.name}
								</CustomText>
								<CustomText style={styles.meta}>
									{category.isIncome
										? "Income category"
										: "Expense category"}
								</CustomText>
								{totals.length === 0 ? (
									<CustomText style={styles.amount}>
										{formatMoney(ZERO_AMOUNT, "INR")}
									</CustomText>
								) : (
									totals.map((total) => (
										<CustomText
											key={total.currencyCode}
											style={[
												styles.amount,
												{
													color:
														compareMoney(
															total.net,
															ZERO_AMOUNT,
														) >= 0
															? COLORS.success
															: COLORS.danger,
												},
											]}
										>
											{!isNativeCurrency ? "≈ " : ""}
											{formatMoney(
												total.net,
												total.currencyCode,
											)}
										</CustomText>
									))
								)}
							</View>
						</View>
						<View style={styles.actions}>
							<Pressable
								accessibilityLabel="Archive"
								accessibilityRole="button"
								hitSlop={8}
								onPress={() =>
									handleArchivePress(
										category.id,
										category.name,
									)
								}
								style={({ pressed }) => [
									styles.actionIcon,
									pressed && styles.actionIconPressed,
								]}
							>
								<Ionicons
									color={COLORS.textMuted}
									name="archive-outline"
									size={17}
								/>
							</Pressable>
						</View>
					</GlassCard>
				</Pressable>
			);
		},
		[analysis, handleArchivePress, isNativeCurrency, navigation],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<SegmentedControl
					onChange={setCategoryFilter}
					options={CATEGORY_FILTER_OPTIONS}
					value={categoryFilter}
				/>
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder="Search categories..."
						value={searchQuery}
					/>
				) : null}
				{analysis?.missingCurrencies.length ? (
					<Notice
						message={`Missing INR rates: ${analysis.missingCurrencies.join(", ")}. Those amounts are excluded from converted totals.`}
						tone="warning"
					/>
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[analysis, categoryFilter, error, searchQuery, searchVisible],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="add-circle-outline"
				message="Add your first category to get started."
				title="No categories yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredListData}
				extraData={[analysis, isNativeCurrency, searchDebounced]}
				keyExtractor={(category) => category.id}
				renderItem={renderCategoryItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("CategoryForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: 15,
		backgroundColor: "rgba(255,255,255,0.055)",
		alignItems: "center",
		justifyContent: "center",
	},
	details: {
		flex: 1,
		gap: 3,
	},
	title: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "900",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
	amount: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
		marginTop: 3,
	},
	actions: {
		marginTop: 12,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
	},
	actionIcon: {
		width: 34,
		height: 34,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.055)",
	},
	actionIconPressed: {
		transform: [{ scale: 0.92 }],
	},
});

export default CategoriesScreen;
