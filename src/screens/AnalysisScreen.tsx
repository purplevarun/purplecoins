import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import DateField from "@/components/DateField";
import DonutChart from "@/components/DonutChart";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeading from "@/components/SectionHeading";
import SegmentedControl from "@/components/SegmentedControl";
import TrendLineChart from "@/components/TrendLineChart";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import financeRepository from "@/repositories/financeRepository";
import analysisService from "@/services/analysisService";
import settingsService from "@/services/settingsService";
import type AnalysisDateRangeInput from "@/types/AnalysisDateRangeInput";
import type AnalysisPeriod from "@/types/AnalysisPeriod";
import type AnalysisScreenProps from "@/types/AnalysisScreenProps";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type ChartDatum from "@/types/ChartDatum";
import type DateRange from "@/types/DateRange";
import type SelectOption from "@/types/SelectOption";
import type SummaryMetricInput from "@/types/SummaryMetricInput";
import type Transaction from "@/types/Transaction";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";
import { getTrendSeries } from "@/utils/trends";
const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getTransactionMinMaxDate, getTransactionRows } = financeRepository;
const { getAnalysisSummary } = analysisService;
const { getFyStartMonth } = settingsService;
const {
	formatDate,
	getAnalysisDateRange,
	getCustomDateRange,
	shiftAnalysisAnchor,
} = dateUtils;
const {
	absoluteMoney,
	addMoney,
	compareMoney,
	formatMoney,
	subtractMoney,
	sumMoney,
	ZERO_AMOUNT,
} = moneyUtils;

const PERIOD_OPTIONS: readonly SelectOption[] = [
	{ label: "Month", value: "MONTH" },
	{ label: "Year", value: "YEAR" },
	{ label: "FY", value: "FY" },
	{ label: "YTD", value: "YTD" },
	{ label: "All", value: "ALL" },
	{ label: "Custom", value: "CUSTOM" },
];

const CHART_COLORS = [
	"#A87CFF",
	"#56D6A3",
	"#60A5FA",
	"#F5B95B",
	"#FF6B86",
	"#67E8F9",
	"#C4B5FD",
	"#FB923C",
] as const;

const getSelectedDateRange = ({
	period,
	anchorDate,
	customStartAt,
	customEndAt,
	fyStartMonth,
}: AnalysisDateRangeInput): DateRange => {
	if (period === "CUSTOM") {
		return getCustomDateRange(customStartAt, customEndAt);
	}
	return getAnalysisDateRange(period, anchorDate, fyStartMonth);
};

const getPeriodTitle = (
	period: AnalysisPeriod,
	anchorDate: Date,
	fyStartMonth: number,
): string => {
	if (period === "MONTH") {
		return anchorDate.toLocaleString("en-IN", {
			month: "long",
			year: "numeric",
		});
	}
	if (period === "YEAR") {
		return String(anchorDate.getFullYear());
	}
	if (period === "FY") {
		const month0 = anchorDate.getMonth() + 1;
		const year = anchorDate.getFullYear();
		const fyStartYear = month0 >= fyStartMonth ? year : year - 1;
		return `FY ${fyStartYear}–${String(fyStartYear + 1).slice(2)}`;
	}
	if (period === "YTD") {
		return "Year to Date";
	}
	if (period === "ALL") {
		return "All transactions";
	}
	return "Custom period";
};

const formatSignedMoney = (amount: string): string => {
	const formattedAmount = formatMoney(amount, DEFAULT_CURRENCY_CODE);
	return compareMoney(amount, ZERO_AMOUNT) > 0
		? `+${formattedAmount}`
		: formattedAmount;
};

const getInvestmentColor = (net: string): string => {
	const comparison = compareMoney(net, ZERO_AMOUNT);
	if (comparison > 0) return COLORS.danger;
	if (comparison < 0) return COLORS.success;
	return COLORS.text;
};

const isShiftNavigationDisabled = (
	period: AnalysisPeriod,
	anchorDate: Date,
	direction: -1 | 1,
	minTxnDate: number | undefined,
	maxTxnDate: number | undefined,
): boolean => {
	if (direction === -1 && minTxnDate === undefined) return false;
	if (direction === 1 && maxTxnDate === undefined) return false;
	const shifted = shiftAnalysisAnchor(
		period,
		anchorDate,
		direction,
		minTxnDate,
		maxTxnDate,
	);
	return shifted === anchorDate;
};

const getDateRangeLabel = (dateRange: DateRange): string =>
	`${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`;

const getMissingRatesMessage = (missingCurrencies: readonly string[]): string =>
	`Update INR exchange rates for ${missingCurrencies.join(", ")} before analysis can include those transactions.`;

const getChartData = (
	summary: AnalysisSummary | null,
	hasMissingCurrencies: boolean,
): readonly ChartDatum[] => {
	if (hasMissingCurrencies) {
		return [];
	}
	return (
		summary?.categories
			.filter((category) => compareMoney(category.net, ZERO_AMOUNT) !== 0)
			.slice(0, CHART_COLORS.length)
			.map((category, index) => ({
				label: category.categoryName,
				value: Number(absoluteMoney(category.net)),
				color: CHART_COLORS[index] ?? COLORS.primary,
			})) ?? []
	);
};

const getSummaryMetrics = (
	summary: AnalysisSummary | null,
	investmentCashFlow: string,
	investmentNet: string,
	netAfterInvestments: string,
): readonly SummaryMetricInput[] => [
	{
		label: "Income",
		value: formatMoney(
			summary?.totalIncome ?? ZERO_AMOUNT,
			DEFAULT_CURRENCY_CODE,
		),
		accent: "success",
		color: COLORS.success,
	},
	{
		label: "Expenses",
		value: formatMoney(
			summary?.totalExpense ?? ZERO_AMOUNT,
			DEFAULT_CURRENCY_CODE,
		),
		accent: "danger",
		color: COLORS.danger,
	},
	{
		label: "Investments",
		value: formatSignedMoney(investmentCashFlow),
		accent: "warning",
		color: getInvestmentColor(investmentNet),
	},
	{
		label: "Net",
		value: formatSignedMoney(summary?.netProfit ?? ZERO_AMOUNT),
		accent:
			compareMoney(summary?.netProfit ?? ZERO_AMOUNT, ZERO_AMOUNT) < 0
				? "danger"
				: "success",
		color:
			compareMoney(summary?.netProfit ?? ZERO_AMOUNT, ZERO_AMOUNT) < 0
				? COLORS.danger
				: COLORS.success,
	},
	{
		label: "Net after investments",
		value: formatSignedMoney(netAfterInvestments),
		accent:
			compareMoney(netAfterInvestments, ZERO_AMOUNT) < 0
				? "danger"
				: "success",
		color:
			compareMoney(netAfterInvestments, ZERO_AMOUNT) < 0
				? COLORS.danger
				: COLORS.success,
	},
];

const HAS_ARROWS: readonly AnalysisPeriod[] = ["MONTH", "YEAR", "FY"];

const AnalysisScreen = ({
	navigation,
}: AnalysisScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [period, setPeriod] = useState<AnalysisPeriod>("MONTH");
	const [anchorDate, setAnchorDate] = useState(new Date());
	const [customStartAt, setCustomStartAt] = useState(() => Date.now());
	const [customEndAt, setCustomEndAt] = useState(() => Date.now());
	const [summary, setSummary] = useState<AnalysisSummary | null>(null);
	const [error, setError] = useState("");
	const [fyStartMonth, setFyStartMonth] = useState(4);
	const [minTxnDate, setMinTxnDate] = useState<number | undefined>(undefined);
	const [maxTxnDate, setMaxTxnDate] = useState<number | undefined>(undefined);
	const [trendTransactions, setTrendTransactions] = useState<
		readonly Transaction[]
	>([]);

	const dateRange = useMemo(
		() =>
			getSelectedDateRange({
				period,
				anchorDate,
				customStartAt,
				customEndAt,
				fyStartMonth,
			}),
		[anchorDate, customEndAt, customStartAt, fyStartMonth, period],
	);

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const [summaryResult, minMax, fy, trendRows] = await Promise.all([
				getAnalysisSummary(database, {
					dateRange,
					isNativeCurrency: false,
				}),
				getTransactionMinMaxDate(database),
				getFyStartMonth(database),
				getTransactionRows(database),
			]);
			setSummary(summaryResult);
			setFyStartMonth(fy);
			if (minMax) {
				setMinTxnDate(minMax.minDate);
				setMaxTxnDate(minMax.maxDate);
			}
			setTrendTransactions(trendRows);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, dateRange]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	const handlePeriodChange = (value: string): void => {
		setPeriod(value as AnalysisPeriod);
	};

	const handleBack = (): void => {
		setAnchorDate((prev) =>
			shiftAnalysisAnchor(period, prev, -1, minTxnDate, maxTxnDate),
		);
	};

	const handleForward = (): void => {
		setAnchorDate((prev) =>
			shiftAnalysisAnchor(period, prev, 1, minTxnDate, maxTxnDate),
		);
	};

	// Determine if arrows are disabled
	const isBackDisabled = useMemo((): boolean => {
		return isShiftNavigationDisabled(
			period,
			anchorDate,
			-1,
			minTxnDate,
			maxTxnDate,
		);
	}, [anchorDate, maxTxnDate, minTxnDate, period]);

	const isForwardDisabled = useMemo((): boolean => {
		return isShiftNavigationDisabled(
			period,
			anchorDate,
			1,
			minTxnDate,
			maxTxnDate,
		);
	}, [anchorDate, maxTxnDate, minTxnDate, period]);

	const hasMissingCurrencies = Boolean(summary?.missingCurrencies.length);
	const investmentNet = sumMoney(
		summary?.investments.map((investment) => investment.net) ?? [],
	);
	const investmentCashFlow = subtractMoney(ZERO_AMOUNT, investmentNet);
	const netAfterInvestments = addMoney(
		summary?.netProfit ?? ZERO_AMOUNT,
		investmentCashFlow,
	);
	const chartData = getChartData(summary, hasMissingCurrencies);
	const summaryMetrics = getSummaryMetrics(
		summary,
		investmentCashFlow,
		investmentNet,
		netAfterInvestments,
	);
	const trendSeries = useMemo(
		() => getTrendSeries(trendTransactions),
		[trendTransactions],
	);

	const renderMetric = (metric: SummaryMetricInput): React.JSX.Element => (
		<View
			key={metric.label}
			style={[
				styles.summaryTile,
				metric.label === "Net after investments" &&
					styles.summaryTileFull,
			]}
		>
			<GlassCard accent={metric.accent}>
				<CustomText style={styles.summaryLabel}>
					{metric.label}
				</CustomText>
				<CustomText
					style={[styles.summaryValue, { color: metric.color }]}
				>
					{metric.value}
				</CustomText>
			</GlassCard>
		</View>
	);

	return (
		<ScreenContainer>
			<SegmentedControl
				onChange={handlePeriodChange}
				options={PERIOD_OPTIONS}
				value={period}
			/>
			{HAS_ARROWS.includes(period) ? (
				<View style={styles.periodRow}>
					<Pressable
						disabled={isBackDisabled}
						onPress={handleBack}
						style={[
							styles.periodButton,
							isBackDisabled && styles.periodButtonDisabled,
						]}
					>
						<Ionicons
							color={
								isBackDisabled ? COLORS.textDim : COLORS.text
							}
							name="chevron-back"
							size={21}
						/>
					</Pressable>
					<View style={styles.periodText}>
						<CustomText style={styles.periodTitle}>
							{getPeriodTitle(period, anchorDate, fyStartMonth)}
						</CustomText>
						<CustomText style={styles.periodRange}>
							{formatDate(dateRange.start)} –{" "}
							{formatDate(dateRange.end)}
						</CustomText>
					</View>
					<Pressable
						disabled={isForwardDisabled}
						onPress={handleForward}
						style={[
							styles.periodButton,
							isForwardDisabled && styles.periodButtonDisabled,
						]}
					>
						<Ionicons
							color={
								isForwardDisabled ? COLORS.textDim : COLORS.text
							}
							name="chevron-forward"
							size={21}
						/>
					</Pressable>
				</View>
			) : null}
			{period === "YTD" ? (
				<View style={styles.periodText}>
					<CustomText style={styles.periodTitle}>
						Year to Date
					</CustomText>
					<CustomText style={styles.periodRange}>
						{formatDate(dateRange.start)} –{" "}
						{formatDate(dateRange.end)}
					</CustomText>
				</View>
			) : null}
			{period === "CUSTOM" ? (
				<GlassCard>
					<View style={styles.customDates}>
						<DateField
							label="From"
							onChange={setCustomStartAt}
							value={customStartAt}
						/>
						<DateField
							label="To"
							onChange={setCustomEndAt}
							value={customEndAt}
						/>
						<CustomText style={styles.periodRange}>
							{formatDate(dateRange.start)} –{" "}
							{formatDate(dateRange.end)}
						</CustomText>
					</View>
				</GlassCard>
			) : null}
			{summary?.missingCurrencies.length ? (
				<Notice
					message={getMissingRatesMessage(summary.missingCurrencies)}
					tone="warning"
				/>
			) : null}
			{error ? <Notice message={error} tone="danger" /> : null}
			{hasMissingCurrencies ? (
				<Pressable
					onPress={() => navigation.navigate("ExchangeRates")}
					style={styles.ratesLink}
				>
					<Ionicons
						color={COLORS.primaryBright}
						name="earth-outline"
						size={18}
					/>
					<CustomText style={styles.ratesLinkText}>
						Manage exchange rates
					</CustomText>
				</Pressable>
			) : (
				<>
					<View style={styles.summaryGrid}>
						{summaryMetrics.map(renderMetric)}
					</View>
					<View style={styles.actionGrid}>
						<AppButton
							icon="list-outline"
							isCompact
							label="See all categories"
							onPress={() =>
								navigation.navigate("AnalysisDetails", {
									mode: "CATEGORIES",
									dateRangeStart: dateRange.start,
									dateRangeEnd: dateRange.end,
									dateRangeLabel:
										getDateRangeLabel(dateRange),
								})
							}
							variant="secondary"
						/>
						<AppButton
							icon="trending-up-outline"
							isCompact
							label="See all investments"
							onPress={() =>
								navigation.navigate("AnalysisDetails", {
									mode: "INVESTMENTS",
									dateRangeStart: dateRange.start,
									dateRangeEnd: dateRange.end,
									dateRangeLabel:
										getDateRangeLabel(dateRange),
								})
							}
							variant="secondary"
						/>
					</View>
					<SectionHeading
						subtitle="Credits minus debits for every category. Classification decides the analysis bucket."
						title="Category net"
					/>
					{chartData.length ? (
						<GlassCard>
							<DonutChart
								centerLabel={formatSignedMoney(
									summary?.netProfit ?? ZERO_AMOUNT,
								)}
								data={chartData}
							/>
						</GlassCard>
					) : (
						<EmptyState
							icon="pie-chart-outline"
							message="Add categorized transactions in this period."
							title="Nothing to analyse"
						/>
					)}
					<SectionHeading
						subtitle="Income, expenses and net worth year by year, across every transaction regardless of the selected period."
						title="Trends"
					/>
					{trendSeries.length ? (
						<GlassCard>
							<TrendLineChart series={trendSeries} />
						</GlassCard>
					) : (
						<EmptyState
							icon="stats-chart-outline"
							message="Add transactions to see trends over time."
							title="No trend data"
						/>
					)}
					<Pressable
						onPress={() => navigation.navigate("ExchangeRates")}
						style={styles.ratesLink}
					>
						<Ionicons
							color={COLORS.primaryBright}
							name="earth-outline"
							size={18}
						/>
						<CustomText style={styles.ratesLinkText}>
							Manage exchange rates
						</CustomText>
					</Pressable>
				</>
			)}
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	periodRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	periodButton: {
		width: 44,
		height: 44,
		borderRadius: 14,
		backgroundColor: "rgba(255,255,255,0.05)",
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: "center",
		justifyContent: "center",
	},
	periodButtonDisabled: {
		opacity: 0.3,
	},
	periodText: {
		alignItems: "center",
		gap: 2,
	},
	periodTitle: {
		color: COLORS.text,
		fontSize: 17,
		fontWeight: "900",
	},
	periodRange: {
		color: COLORS.textMuted,
		fontSize: 11,
	},
	customDates: {
		gap: 12,
	},
	summaryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		rowGap: 10,
	},
	actionGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 12,
	},
	summaryTile: {
		width: "48.5%",
	},
	summaryTileFull: {
		width: "100%",
	},
	summaryLabel: {
		color: COLORS.textMuted,
		fontSize: 11,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: 0.7,
	},
	summaryValue: {
		fontSize: 14,
		fontWeight: "900",
		marginTop: 5,
	},
	ratesLink: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		justifyContent: "center",
		padding: 14,
	},
	ratesLinkText: {
		color: COLORS.primaryBright,
		fontSize: 13,
		fontWeight: "800",
	},
});

export default AnalysisScreen;

export {
	formatSignedMoney,
	getChartData,
	getDateRangeLabel,
	getInvestmentColor,
	getMissingRatesMessage,
	getPeriodTitle,
	getSelectedDateRange,
	getSummaryMetrics,
	HAS_ARROWS,
	isShiftNavigationDisabled,
};
