import CustomText from "@/components/CustomText";
import type ListItemProps from "@/types/ListItemProps";

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
import PagedScreenList from "@/components/PagedScreenList";
import ScreenList from "@/components/ScreenList";
import SearchBar from "@/components/SearchBar";
import SegmentedControl from "@/components/SegmentedControl";
import COLORS from "@/constants/colors";
import dateConstants from "@/constants/dateConstants";
import styleConstants from "@/constants/styleConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import analysisService from "@/services/analysisService";
import exchangeRateService from "@/services/exchangeRateService";
import investmentService from "@/services/investmentService";
import investmentTypeService from "@/services/investmentTypeService";
import platformService from "@/services/platformService";
import settingsService from "@/services/settingsService";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type ExchangeRate from "@/types/ExchangeRate";
import type Investment from "@/types/Investment";
import type InvestmentGroupBy from "@/types/InvestmentGroupBy";
import type InvestmentListItem from "@/types/InvestmentListItem";
import type InvestmentsScreenProps from "@/types/InvestmentsScreenProps";
import type InvestmentType from "@/types/InvestmentType";
import type Platform from "@/types/Platform";
import type SelectOption from "@/types/SelectOption";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
const { getAnalysisSummary, getInvestmentNetAmount, getInvestmentNetLabel } =
	analysisService;
const { getExchangeRates } = exchangeRateService;
const { getInvestments, setInvestmentArchived } = investmentService;
const { getNativeCurrencyDisplay } = settingsService;
const { compareMoney, formatMoney, ZERO_AMOUNT } = moneyUtils;

const { ALL_TIME_END, ALL_TIME_START } = dateConstants;

const GROUP_BY_OPTIONS: readonly SelectOption[] = [
	{ label: "Investments", value: "INVESTMENTS" },
	{ label: "Platforms", value: "PLATFORMS" },
	{ label: "Types", value: "TYPES" },
];

const getInvestmentGroupKey = (
	investment: Investment,
	groupBy: "PLATFORM" | "TYPE",
): string => {
	const key =
		(groupBy === "PLATFORM"
			? investment.platformName
			: investment.investmentTypeName
		)?.trim() ?? "";
	if (key.length > 0) return key;
	return groupBy === "PLATFORM" ? "No platform" : "No type";
};

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
	const [groupBy, setGroupBy] = useState<
		InvestmentGroupBy | "INVESTMENTS" | "PLATFORMS" | "TYPES"
	>("INVESTMENTS");
	const [platforms, setPlatforms] = useState<readonly Platform[]>([]);
	const [investmentTypes, setInvestmentTypes] = useState<
		readonly InvestmentType[]
	>([]);

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
			const [loadedPlatforms, loadedTypes] = await Promise.all([
				platformService.getPlatforms(database),
				investmentTypeService.getInvestmentTypes(database),
			]);
			setInvestments(loadedInvestments);
			setAnalysis(loadedAnalysis);
			setPlatforms(loadedPlatforms);
			setInvestmentTypes(loadedTypes);
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

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
				<HeaderIconButton
					accessibilityLabel={
						searchVisible ? "Close search" : "Search"
					}
					icon={searchVisible ? "close-outline" : "search-outline"}
					isActive={searchVisible}
					onPress={() => {
						setSearchVisible((visible) => !visible);
						setSearchQuery("");
						setSearchDebounced("");
					}}
				/>
			),
		});
	}, [navigation, searchVisible]);

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
		if (groupBy === "NONE" || groupBy === "INVESTMENTS") {
			return items;
		}
		const groups = new Map<string, InvestmentListItem[]>();
		filteredListData.forEach((investment) => {
			const key = getInvestmentGroupKey(
				investment,
				groupBy === "PLATFORM" || groupBy === "TYPE"
					? groupBy
					: "PLATFORM",
			);
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
		({ item }: ListItemProps<InvestmentListItem>): React.JSX.Element => {
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
								{investment.platformName ||
								investment.investmentTypeName ? (
									<CustomText style={styles.meta}>
										{[
											investment.platformName,
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

	const renderRelationItem = useCallback(
		({
			item,
		}: ListItemProps<Platform | InvestmentType>): React.JSX.Element => (
			<Pressable
				accessibilityRole="button"
				onPress={() =>
					navigation.navigate("RelationDetails", {
						kind:
							groupBy === "PLATFORMS"
								? "PLATFORM"
								: "INVESTMENT_TYPE",
						entityId: item.id,
						entityName: item.name,
					})
				}
			>
				<GlassCard>
					<CustomText style={styles.title}>{item.name}</CustomText>
				</GlassCard>
			</Pressable>
		),
		[groupBy, navigation],
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
				message={
					groupBy === "PLATFORMS"
						? "Add your first platform to get started."
						: groupBy === "TYPES"
							? "Add your first investment type to get started."
							: "Add your first investment to get started."
				}
				title={
					groupBy === "PLATFORMS"
						? "No Investment Platforms yet"
						: groupBy === "TYPES"
							? "No Investment Types yet"
							: "No investments yet"
				}
			/>
		),
		[groupBy],
	);

	return (
		<View style={styles.screen}>
			{groupBy === "PLATFORMS" || groupBy === "TYPES" ? (
				<ScreenList<Platform | InvestmentType>
					key={groupBy}
					ListEmptyComponent={listEmpty}
					ListHeaderComponent={listHeader}
					data={(groupBy === "PLATFORMS"
						? platforms
						: investmentTypes
					).filter((item) =>
						item.name
							.toLowerCase()
							.includes(searchDebounced.trim().toLowerCase()),
					)}
					keyExtractor={(item) => item.id}
					renderItem={renderRelationItem}
				/>
			) : (
				<PagedScreenList<InvestmentListItem>
					key="INVESTMENTS"
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
			)}
			<FloatingAddButton
				onPress={() =>
					navigation.navigate(
						groupBy === "PLATFORMS"
							? "Platforms"
							: groupBy === "TYPES"
								? "InvestmentTypes"
								: "InvestmentForm",
					)
				}
			/>
		</View>
	);
};

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	RADIUS,
	SCALE,
	SIZES,
	SPACING,
	TEXT_TRANSFORM,
} = styleConstants;

const styles = StyleSheet.create({
	screen: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.background,
	},
	row: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.START,
		gap: SPACING.S12,
	},
	iconBox: {
		width: SIZES.S44,
		height: SIZES.S44,
		borderRadius: RADIUS.S15,
		backgroundColor: COLORS.surfaceRaised,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
	},
	details: {
		flex: FLEX.FILL,
		gap: SPACING.S3,
	},
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S16,
		fontWeight: FONT_WEIGHT.BLACK,
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
	},
	amount: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		fontWeight: FONT_WEIGHT.BLACK,
		marginTop: SPACING.S3,
	},
	actions: {
		marginTop: SPACING.S12,
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.END,
		gap: SPACING.S8,
	},
	actionIcon: {
		width: SIZES.S34,
		height: SIZES.S34,
		borderRadius: RADIUS.S12,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surfaceRaised,
	},
	actionIconPressed: {
		transform: [{ scale: SCALE.STRONG }],
	},
	investmentTotals: {
		marginTop: SPACING.S5,
		gap: SPACING.S2,
	},
	groupHeader: {
		paddingTop: SPACING.S6,
		paddingBottom: SPACING.S2,
		paddingHorizontal: SPACING.S2,
	},
	groupHeaderText: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		fontWeight: FONT_WEIGHT.BLACK,
		textTransform: TEXT_TRANSFORM.UPPERCASE,
		letterSpacing: LETTER_SPACING.WIDE,
	},
});

export default InvestmentsScreen;
