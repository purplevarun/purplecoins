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
import exchangeRateService from "@/services/exchangeRateService";
import investmentService from "@/services/investmentService";
import settingsService from "@/services/settingsService";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type ExchangeRate from "@/types/ExchangeRate";
import type Investment from "@/types/Investment";
import type InvestmentsScreenProps from "@/types/InvestmentsScreenProps";
import type SelectOption from "@/types/SelectOption";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
const { getAnalysisSummary, getInvestmentNetAmount, getInvestmentNetLabel } =
	analysisService;
const { getExchangeRates } = exchangeRateService;
const { getInvestments, setInvestmentArchived } = investmentService;
const { getNativeCurrencyDisplay, updateNativeCurrencyDisplay } =
	settingsService;
const { compareMoney, formatMoney, ZERO_AMOUNT } = moneyUtils;

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;

type InvestmentGroupBy = "NONE" | "LABEL" | "TYPE";

const GROUP_BY_OPTIONS: readonly SelectOption[] = [
	{ label: "None", value: "NONE" },
	{ label: "Label", value: "LABEL" },
	{ label: "Type", value: "TYPE" },
];

const getInvestmentGroupKey = (
	investment: Investment,
	groupBy: "LABEL" | "TYPE",
): string =>
	groupBy === "LABEL"
		? investment.label?.trim() || "No label"
		: investment.investmentTypeName?.trim() || "No type";

type InvestmentListItem =
	| { kind: "INVESTMENT"; entity: Investment }
	| { kind: "GROUP_HEADER"; title: string };

const InvestmentsScreen = ({
	navigation,
}: InvestmentsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [exchangeRates, setExchangeRates] = useState<readonly ExchangeRate[]>(
		[],
	);
	const [error, setError] = useState("");
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");
	const [groupBy, setGroupBy] = useState<InvestmentGroupBy>("NONE");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setError("");
			const [nativeCurrency, loadedRates] = await Promise.all([
				getNativeCurrencyDisplay(database),
				getExchangeRates(database),
			]);
			setIsNativeCurrency(nativeCurrency);
			setExchangeRates(loadedRates);
			const [loadedInvestments, loadedAnalysis] = await Promise.all([
				getInvestments(database),
				getAnalysisSummary(database, {
					dateRange: { start: ALL_TIME_START, end: ALL_TIME_END },
					isNativeCurrency: nativeCurrency,
				}),
			]);
			setInvestments(loadedInvestments);
			setAnalysis(loadedAnalysis);
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useFocusEffect(
		useCallback(() => {
			void getScreenData();
		}, [getScreenData]),
	);

	const handleToggleCurrency = useCallback(async (): Promise<void> => {
		const nextValue = !isNativeCurrency;
		await updateNativeCurrencyDisplay(database, nextValue);
		setIsNativeCurrency(nextValue);
		await getScreenData();
	}, [database, getScreenData, isNativeCurrency]);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={{ flexDirection: "row", gap: 4 }}>
					<HeaderIconButton
						accessibilityLabel={
							searchVisible ? "Close search" : "Search"
						}
						icon={
							searchVisible ? "close-outline" : "search-outline"
						}
						isActive={searchVisible}
						onPress={() => {
							setSearchVisible((v) => !v);
							setSearchQuery("");
							setSearchDebounced("");
						}}
					/>
					<HeaderIconButton
						accessibilityLabel={
							isNativeCurrency
								? "Convert to INR"
								: "Show native currencies"
						}
						icon="earth-outline"
						isActive={!isNativeCurrency}
						onPress={() => void handleToggleCurrency()}
					/>
				</View>
			),
		});
	}, [handleToggleCurrency, isNativeCurrency, navigation, searchVisible]);

	const handleArchive = useCallback(
		async (id: string): Promise<void> => {
			try {
				await setInvestmentArchived(database, id, true);
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
			[...investments].sort((a, b) => {
				const netA = (analysis?.investments ?? [])
					.filter((row) => row.investmentId === a.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.net, row.currencyCode)),
						new Decimal(0),
					);
				const netB = (analysis?.investments ?? [])
					.filter((row) => row.investmentId === b.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.net, row.currencyCode)),
						new Decimal(0),
					);
				// net = invested - redeemed; most invested (most positive net) first
				return netB.comparedTo(netA);
			}),
		[analysis, investments, toInr],
	);

	const filteredListData = useMemo(() => {
		if (!searchDebounced.trim()) return listData;
		const q = searchDebounced.trim().toLowerCase();
		return listData.filter((investment) =>
			investment.name.toLowerCase().includes(q),
		);
	}, [listData, searchDebounced]);

	const groupedListData = useMemo((): readonly InvestmentListItem[] => {
		const items: readonly InvestmentListItem[] = filteredListData.map(
			(entity) => ({ kind: "INVESTMENT" as const, entity }),
		);
		if (groupBy === "NONE") {
			return items;
		}
		const groups = new Map<string, InvestmentListItem[]>();
		filteredListData.forEach((investment) => {
			const key = getInvestmentGroupKey(investment, groupBy);
			groups.set(key, [
				...(groups.get(key) ?? []),
				{ kind: "INVESTMENT" as const, entity: investment },
			]);
		});
		return [...groups]
			.sort(([left], [right]) => left.localeCompare(right))
			.flatMap(([title, groupItems]) => [
				{ kind: "GROUP_HEADER" as const, title },
				...groupItems,
			]);
	}, [filteredListData, groupBy]);

	const renderInvestmentItem = useCallback(
		({ item }: { item: InvestmentListItem }): React.JSX.Element => {
			if (item.kind === "GROUP_HEADER") {
				return (
					<View style={styles.groupHeader}>
						<CustomText style={styles.groupHeaderText}>
							{item.title}
						</CustomText>
					</View>
				);
			}
			const investment = item.entity;
			const investmentTotals =
				analysis?.investments.filter(
					(row) => row.investmentId === investment.id,
				) ?? [];
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: "INVESTMENT",
							entityId: investment.id,
							entityName: investment.name,
						})
					}
				>
					<GlassCard>
						<View style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									color={COLORS.success}
									name="trending-up"
									size={22}
								/>
							</View>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{investment.name}
								</CustomText>
								{investment.label ||
								investment.investmentTypeName ? (
									<CustomText style={styles.meta}>
										{[
											investment.label,
											investment.investmentTypeName,
										]
											.filter(Boolean)
											.join(" \u00b7 ")}
									</CustomText>
								) : null}
								{investmentTotals.map((total) => (
									<View
										key={total.currencyCode}
										style={styles.investmentTotals}
									>
										<CustomText style={styles.meta}>
											Invested{" "}
											{formatMoney(
												total.totalInvested,
												total.currencyCode,
											)}
										</CustomText>
										<CustomText style={styles.meta}>
											Redeemed{" "}
											{formatMoney(
												total.totalRedeemed,
												total.currencyCode,
											)}
										</CustomText>
										<CustomText
											style={[
												styles.amount,
												{
													color:
														compareMoney(
															total.net,
															ZERO_AMOUNT,
														) > 0
															? COLORS.danger
															: compareMoney(
																		total.net,
																		ZERO_AMOUNT,
																  ) < 0
																? COLORS.success
																: COLORS.text,
												},
											]}
										>
											{!isNativeCurrency ? "≈ " : ""}
											{getInvestmentNetLabel(
												total.net,
											)}{" "}
											{formatMoney(
												getInvestmentNetAmount(
													total.net,
												),
												total.currencyCode,
											)}
										</CustomText>
									</View>
								))}
							</View>
						</View>
						<View style={styles.actions}>
							<Pressable
								accessibilityLabel="Archive"
								accessibilityRole="button"
								hitSlop={8}
								onPress={() =>
									handleArchivePress(
										investment.id,
										investment.name,
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
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder="Search investments..."
						value={searchQuery}
					/>
				) : null}
				<SegmentedControl
					onChange={(value) => setGroupBy(value as InvestmentGroupBy)}
					options={GROUP_BY_OPTIONS}
					value={groupBy}
				/>
				{analysis?.missingCurrencies.length ? (
					<Notice
						message={`Missing INR rates: ${analysis.missingCurrencies.join(", ")}. Those amounts are excluded from converted totals.`}
						tone="warning"
					/>
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[analysis, error, groupBy, searchQuery, searchVisible],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="add-circle-outline"
				message="Add your first investment to get started."
				title="No investments yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={groupedListData}
				extraData={[
					analysis,
					groupBy,
					isNativeCurrency,
					searchDebounced,
				]}
				keyExtractor={(item) =>
					item.kind === "GROUP_HEADER"
						? `group:${item.title}`
						: item.entity.id
				}
				renderItem={renderInvestmentItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("InvestmentForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
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
	investmentTotals: {
		marginTop: 5,
		gap: 2,
	},
	groupHeader: {
		paddingTop: 6,
		paddingBottom: 2,
		paddingHorizontal: 2,
	},
	groupHeaderText: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "900",
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
});

export default InvestmentsScreen;
