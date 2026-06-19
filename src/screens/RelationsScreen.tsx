import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Decimal from "decimal.js";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { SearchBar } from "@/components/SearchBar";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
} from "@/services/analysisService";
import { getCategories } from "@/services/categoryService";
import { getExchangeRates } from "@/services/exchangeRateService";
import { getInvestments } from "@/services/investmentService";
import {
	getNativeCurrencyDisplay,
	updateNativeCurrencyDisplay,
} from "@/services/settingsService";
import { getSources, validateSource } from "@/services/sourceService";
import { getTrips } from "@/services/tripService";
import { getTripTotals } from "@/services/tripTotalService";
import type { AnalysisSummary } from "@/types/AnalysisSummary";
import type { Category } from "@/types/Category";
import type { ExchangeRate } from "@/types/ExchangeRate";
import type { Investment } from "@/types/Investment";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { Source } from "@/types/Source";
import type { Trip } from "@/types/Trip";
import type { TripTotal } from "@/types/TripTotal";
import { getErrorMessage } from "@/utils/error";
import { compareMoney, formatMoney, ZERO_AMOUNT } from "@/utils/money";
import { getRelationLabels } from "@/utils/relation";

type RelationsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Relations"
>;

type RelationListItem =
	| { kind: "SOURCE"; entity: Source }
	| { kind: "CATEGORY"; entity: Category }
	| { kind: "TRIP"; entity: Trip }
	| { kind: "INVESTMENT"; entity: Investment };

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;

const RelationsScreen = ({
	navigation,
	route,
}: RelationsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { kind } = route.params;
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [tripTotals, setTripTotals] = useState<readonly TripTotal[]>([]);
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

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setError("");
			const [nativeCurrency, loadedRates] = await Promise.all([
				getNativeCurrencyDisplay(database),
				getExchangeRates(database),
			]);
			setIsNativeCurrency(nativeCurrency);
			setExchangeRates(loadedRates);
			if (kind === "SOURCE") {
				setAnalysis(null);
				setTripTotals([]);
				setSources(await getSources(database));
				return;
			}
			if (kind === "CATEGORY") {
				setTripTotals([]);
				const [loadedCategories, loadedAnalysis] = await Promise.all([
					getCategories(database),
					getAnalysisSummary(database, {
						dateRange: {
							start: ALL_TIME_START,
							end: ALL_TIME_END,
						},
						isNativeCurrency: nativeCurrency,
					}),
				]);
				setCategories(loadedCategories);
				setAnalysis(loadedAnalysis);
				return;
			}
			if (kind === "TRIP") {
				setAnalysis(null);
				const [loadedTrips, loadedTripTotals] = await Promise.all([
					getTrips(database),
					getTripTotals(database),
				]);
				setTrips(loadedTrips);
				setTripTotals(loadedTripTotals);
				return;
			}
			setTripTotals([]);
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
	}, [database, kind]);

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
	}, [
		handleToggleCurrency,
		isNativeCurrency,
		kind,
		navigation,
		searchVisible,
	]);

	const handleValidate = useCallback(
		async (id: string): Promise<void> => {
			try {
				await validateSource(database, id);
				refreshData();
			} catch (caughtError: unknown) {
				dialog.showMessage({
					title: "Unable to validate",
					message: getErrorMessage(caughtError),
					variant: "danger",
				});
			}
		},
		[database, dialog, refreshData],
	);

	const rateMap = useMemo((): Map<string, Decimal> => {
		const map = new Map<string, Decimal>();
		for (const rate of exchangeRates) {
			map.set(rate.currencyCode, new Decimal(rate.rateToInr));
		}
		// INR to INR is always 1
		map.set("INR", new Decimal(1));
		return map;
	}, [exchangeRates]);

	const toInr = useCallback(
		(amount: string, currencyCode: string): Decimal => {
			const rate = rateMap.get(currencyCode);
			if (!rate) {
				// No rate: only count if already INR, else treat as 0
				return currencyCode === "INR"
					? new Decimal(amount)
					: new Decimal(0);
			}
			return new Decimal(amount).times(rate);
		},
		[rateMap],
	);

	const listData = useMemo((): readonly RelationListItem[] => {
		if (kind === "SOURCE") {
			return [...sources]
				.map((entity) => ({ kind: "SOURCE" as const, entity }))
				.sort((a, b) =>
					toInr(a.entity.balance, a.entity.currencyCode).comparedTo(
						toInr(b.entity.balance, b.entity.currencyCode),
					),
				);
		}
		if (kind === "CATEGORY") {
			return [...categories]
				.map((entity) => ({ kind: "CATEGORY" as const, entity }))
				.sort((a, b) => {
					const netA = (analysis?.categories ?? [])
						.filter((row) => row.categoryId === a.entity.id)
						.reduce(
							(sum, row) =>
								sum.plus(toInr(row.net, row.currencyCode)),
							new Decimal(0),
						);
					const netB = (analysis?.categories ?? [])
						.filter((row) => row.categoryId === b.entity.id)
						.reduce(
							(sum, row) =>
								sum.plus(toInr(row.net, row.currencyCode)),
							new Decimal(0),
						);
					return netA.comparedTo(netB);
				});
		}
		if (kind === "TRIP") {
			return [...trips]
				.map((entity) => ({ kind: "TRIP" as const, entity }))
				.sort((a, b) => {
					const totalA = tripTotals
						.filter((row) => row.tripId === a.entity.id)
						.reduce(
							(sum, row) =>
								sum.plus(toInr(row.total, row.currencyCode)),
							new Decimal(0),
						);
					const totalB = tripTotals
						.filter((row) => row.tripId === b.entity.id)
						.reduce(
							(sum, row) =>
								sum.plus(toInr(row.total, row.currencyCode)),
							new Decimal(0),
						);
					// Trip totals are positive = spent; sort most spent first (descending)
					return totalB.comparedTo(totalA);
				});
		}
		return [...investments]
			.map((entity) => ({ kind: "INVESTMENT" as const, entity }))
			.sort((a, b) => {
				const netA = (analysis?.investments ?? [])
					.filter((row) => row.investmentId === a.entity.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.net, row.currencyCode)),
						new Decimal(0),
					);
				const netB = (analysis?.investments ?? [])
					.filter((row) => row.investmentId === b.entity.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.net, row.currencyCode)),
						new Decimal(0),
					);
				// net = invested - redeemed; most invested (most positive net) first
				return netB.comparedTo(netA);
			});
	}, [
		analysis,
		categories,
		investments,
		kind,
		sources,
		toInr,
		tripTotals,
		trips,
	]);

	const filteredListData = useMemo((): readonly RelationListItem[] => {
		if (!searchDebounced.trim()) return listData;
		const q = searchDebounced.trim().toLowerCase();
		return listData.filter((item) =>
			item.entity.name.toLowerCase().includes(q),
		);
	}, [listData, searchDebounced]);

	const renderRelationItem = useCallback(
		({ item }: { item: RelationListItem }): React.JSX.Element => {
			if (item.kind === "SOURCE") {
				const source = item.entity;
				const isValidated =
					source.validatedAt !== null &&
					(source.latestTransactionCreatedAt === null ||
						source.validatedAt >=
							source.latestTransactionCreatedAt);
				return (
					<Pressable
						onPress={() =>
							navigation.navigate("LinkedTransactions", {
								kind: "SOURCE",
								entityId: source.id,
								entityName: source.name,
							})
						}
					>
						<GlassCard accent={isValidated ? "success" : "default"}>
							<View style={styles.row}>
								<View style={styles.iconBox}>
									<Ionicons
										color={COLORS.blue}
										name="wallet-outline"
										size={22}
									/>
								</View>
								<View style={styles.details}>
									<View style={styles.titleRow}>
										<CustomText style={styles.title}>
											{source.name}
										</CustomText>
										{isValidated ? (
											<View style={styles.validatedBadge}>
												<Ionicons
													color={COLORS.success}
													name="checkmark-circle"
													size={14}
												/>
												<CustomText
													style={styles.validatedText}
												>
													Validated
												</CustomText>
											</View>
										) : null}
									</View>
									<CustomText style={styles.meta}>
										{source.currencyCode}
									</CustomText>
									<CustomText style={styles.amount}>
										{formatMoney(
											source.balance,
											source.currencyCode,
										)}
									</CustomText>
									{!isNativeCurrency &&
									source.currencyCode !== "INR"
										? (() => {
												const inrVal = toInr(
													source.balance,
													source.currencyCode,
												);
												if (inrVal.isZero())
													return null;
												const isPositive =
													inrVal.gte(0);
												return (
													<CustomText
														style={[
															styles.convertedAmount,
															{
																color: isPositive
																	? COLORS.success
																	: COLORS.danger,
															},
														]}
													>
														{"≈ "}
														{formatMoney(
															inrVal
																.abs()
																.toFixed(),
															"INR",
														)}
													</CustomText>
												);
											})()
										: null}
								</View>
							</View>
							<View style={styles.actions}>
								<AppButton
									icon="checkmark-done"
									isCompact
									label="Validate"
									onPress={() =>
										void handleValidate(source.id)
									}
									variant="success"
								/>
							</View>
						</GlassCard>
					</Pressable>
				);
			}
			if (item.kind === "CATEGORY") {
				const category = item.entity;
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
						</GlassCard>
					</Pressable>
				);
			}
			const entity = item.entity;
			const totals =
				item.kind === "TRIP"
					? tripTotals.filter((row) => row.tripId === entity.id)
					: [];
			const investmentTotals =
				item.kind === "INVESTMENT"
					? (analysis?.investments.filter(
							(row) => row.investmentId === entity.id,
						) ?? [])
					: [];
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: item.kind,
							entityId: entity.id,
							entityName: entity.name,
						})
					}
				>
					<GlassCard>
						<View style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									color={
										item.kind === "TRIP"
											? COLORS.blue
											: COLORS.success
									}
									name={
										item.kind === "TRIP"
											? "airplane-outline"
											: "trending-up"
									}
									size={22}
								/>
							</View>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{entity.name}
								</CustomText>
								{item.kind === "TRIP" ? (
									totals.length ? (
										totals.map((total) => (
											<CustomText
												key={total.currencyCode}
												style={[
													styles.amount,
													{
														color:
															compareMoney(
																total.total,
																ZERO_AMOUNT,
															) >= 0
																? COLORS.danger
																: COLORS.success,
													},
												]}
											>
												Total{" "}
												{formatMoney(
													total.total,
													total.currencyCode,
												)}
											</CustomText>
										))
									) : (
										<CustomText style={styles.amount}>
											Total{" "}
											{formatMoney(ZERO_AMOUNT, "INR")}
										</CustomText>
									)
								) : null}
								{item.kind === "TRIP" &&
								!isNativeCurrency &&
								totals.some((t) => t.currencyCode !== "INR")
									? (() => {
											const inrTotal = totals.reduce(
												(sum, t) =>
													sum.plus(
														toInr(
															t.total,
															t.currencyCode,
														),
													),
												new Decimal(0),
											);
											return (
												<CustomText
													style={[
														styles.convertedAmount,
														{
															color: inrTotal.gte(
																0,
															)
																? COLORS.danger
																: COLORS.success,
														},
													]}
												>
													≈{" "}
													{formatMoney(
														inrTotal
															.abs()
															.toFixed(),
														"INR",
													)}
												</CustomText>
											);
										})()
									: null}
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
					</GlassCard>
				</Pressable>
			);
		},
		[analysis, handleValidate, navigation, tripTotals],
	);

	const relationLabels = getRelationLabels(kind);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder={`Search ${relationLabels.plural}...`}
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
		[analysis, error, relationLabels.plural, searchQuery, searchVisible],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="add-circle-outline"
				message={`Add your first ${relationLabels.singular} to get started.`}
				title={`No ${relationLabels.plural} yet`}
			/>
		),
		[relationLabels.plural, relationLabels.singular],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredListData}
				extraData={[analysis, isNativeCurrency, searchDebounced]}
				keyExtractor={(item) => item.entity.id}
				renderItem={renderRelationItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("RelationForm", { kind })}
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
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flexWrap: "wrap",
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
	convertedAmount: {
		fontSize: 13,
		fontWeight: "900",
		marginTop: 1,
	},
	validatedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 3,
		backgroundColor: COLORS.successMuted,
	},
	validatedText: {
		color: COLORS.success,
		fontSize: 10,
		fontWeight: "900",
	},
	actions: {
		marginTop: 12,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
	},
	investmentTotals: {
		marginTop: 5,
		gap: 2,
	},
});

export { RelationsScreen };
