import type { BarDatum } from "@/components/BarChart";
import BarChart from "@/components/BarChart";
import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import DateField from "@/components/DateField";
import DonutChart from "@/components/DonutChart";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeading from "@/components/SectionHeading";
import SegmentedControl from "@/components/SegmentedControl";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import financeRepository from "@/repositories/financeRepository";
import analysisService from "@/services/analysisService";
import settingsService from "@/services/settingsService";
import type AnalysisPeriod from "@/types/AnalysisPeriod";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type ChartDatum from "@/types/ChartDatum";
import type DateRange from "@/types/DateRange";
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import type Transaction from "@/types/Transaction";
import type TrendPoint from "@/types/TrendPoint";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";

const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getTransactionMinMaxDate, getTransactionRowsInRange } =
	financeRepository;
const {
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
	getPeriodTrend,
} = analysisService;
const { getFyStartMonth } = settingsService;
const {
	formatDate,
	getAnalysisDateRange,
	getCustomDateRange,
	getPreviousDateRange,
	getYearOverYearDateRange,
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

type AnalysisScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Analysis"
>;

type AnalysisDateRangeInput = Readonly<{
	period: AnalysisPeriod;
	anchorDate: Date;
	customStartAt: number;
	customEndAt: number;
	fyStartMonth: number;
}>;

type SummaryMetricInput = Readonly<{
	label: string;
	value: string;
	accent: "success" | "danger" | "warning" | "default";
	color: string;
	pctText?: string;
	pctColor?: string;
}>;

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
		return `YTD ${String(anchorDate.getFullYear())}`;
	}
	if (period === "ALL") {
		return "All transactions";
	}
	return "Custom period";
};

const getDateRangeLabel = (
	period: AnalysisPeriod,
	dateRange: DateRange,
): string => {
	if (period === "ALL") {
		return "All time";
	}
	if (period === "CUSTOM") {
		return "Custom";
	}
	return `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`;
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

const getInvestmentAccent = (net: string): "success" | "danger" | "default" => {
	const comparison = compareMoney(net, ZERO_AMOUNT);
	if (comparison > 0) return "danger";
	if (comparison < 0) return "success";
	return "default";
};

const getPercentChange = (current: string, previous: string): number | null => {
	const prev = Number(previous);
	if (prev === 0) return null;
	return ((Number(current) - prev) / Math.abs(prev)) * 100;
};

const buildPctDisplay = (
	pct: number | null,
	higherIsBetter: boolean,
): { pctText: string; pctColor: string } => {
	if (pct === null) {
		return { pctText: "\u2014", pctColor: COLORS.textMuted };
	}
	const sign = pct > 0 ? "+" : "";
	const improved = higherIsBetter ? pct > 0 : pct < 0;
	return {
		pctText: `${sign}${pct.toFixed(1)}%`,
		pctColor:
			pct === 0
				? COLORS.textMuted
				: improved
					? COLORS.success
					: COLORS.danger,
	};
};

const HAS_ARROWS: readonly AnalysisPeriod[] = ["MONTH", "YEAR", "FY", "YTD"];

const AnalysisScreen = ({
	navigation,
}: AnalysisScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [period, setPeriod] = useState<AnalysisPeriod>("MONTH");
	const [anchorDate, setAnchorDate] = useState(new Date());
	const [customStartAt, setCustomStartAt] = useState(() => Date.now());
	const [customEndAt, setCustomEndAt] = useState(() => Date.now());
	const [summary, setSummary] = useState<AnalysisSummary | null>(null);
	const [previousSummary, setPreviousSummary] =
		useState<AnalysisSummary | null>(null);
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [error, setError] = useState("");
	const [fyStartMonth, setFyStartMonth] = useState(4);
	const [minTxnDate, setMinTxnDate] = useState<number | undefined>(undefined);
	const [maxTxnDate, setMaxTxnDate] = useState<number | undefined>(undefined);
	const [yoySummary, setYoySummary] = useState<AnalysisSummary | null>(null);
	const [periodTrend, setPeriodTrend] = useState<readonly TrendPoint[]>([]);
	const [carouselIndex, setCarouselIndex] = useState(0);

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

	const previousDateRange = useMemo(
		() => getPreviousDateRange(period, anchorDate, fyStartMonth),
		[anchorDate, fyStartMonth, period],
	);

	const yoyDateRange = useMemo(
		() => getYearOverYearDateRange(period, anchorDate, fyStartMonth),
		[anchorDate, fyStartMonth, period],
	);

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const [
				summaryResult,
				minMax,
				fy,
				prevSummaryResult,
				txnRows,
				yoySummaryResult,
			] = await Promise.all([
				getAnalysisSummary(database, {
					dateRange,
					isNativeCurrency: false,
				}),
				getTransactionMinMaxDate(database),
				getFyStartMonth(database),
				previousDateRange
					? getAnalysisSummary(database, {
						dateRange: previousDateRange,
						isNativeCurrency: false,
					})
					: Promise.resolve(null),
				getTransactionRowsInRange(
					database,
					dateRange.start,
					dateRange.end,
				),
				yoyDateRange
					? getAnalysisSummary(database, {
						dateRange: yoyDateRange,
						isNativeCurrency: false,
					})
					: Promise.resolve(null),
			]);
			const periodTrendResult = await getPeriodTrend(database, {
				dateRange,
				period,
				anchorDate,
				fyStartMonth: fy,
				minTxnDate: minMax?.minDate,
				maxTxnDate: minMax?.maxDate,
			});
			setSummary(summaryResult);
			setFyStartMonth(fy);
			setPreviousSummary(prevSummaryResult);
			setTransactions(txnRows);
			setYoySummary(yoySummaryResult);
			setPeriodTrend(periodTrendResult);
			if (minMax) {
				setMinTxnDate(minMax.minDate);
				setMaxTxnDate(minMax.maxDate);
			}
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [
		anchorDate,
		database,
		dateRange,
		period,
		previousDateRange,
		yoyDateRange,
	]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	const handlePeriodChange = (value: string): void => {
		setPeriod(value as AnalysisPeriod);
		setCarouselIndex(0);
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
		if (minTxnDate === undefined) return false;
		const prev = shiftAnalysisAnchor(
			period,
			anchorDate,
			-1,
			minTxnDate,
			maxTxnDate,
		);
		return prev === anchorDate;
	}, [anchorDate, maxTxnDate, minTxnDate, period]);

	const isForwardDisabled = useMemo((): boolean => {
		// YTD caps at the current calendar year regardless of transaction data
		if (period === "YTD") {
			return anchorDate.getFullYear() >= new Date().getFullYear();
		}
		if (maxTxnDate === undefined) return false;
		const next = shiftAnalysisAnchor(
			period,
			anchorDate,
			1,
			minTxnDate,
			maxTxnDate,
		);
		return next === anchorDate;
	}, [anchorDate, maxTxnDate, minTxnDate, period]);

	const investmentNet = sumMoney(
		summary?.investments.map((investment) => investment.net) ?? [],
	);
	const investmentCashFlow = subtractMoney(ZERO_AMOUNT, investmentNet);
	const netAfterInvestments = addMoney(
		summary?.netProfit ?? ZERO_AMOUNT,
		investmentCashFlow,
	);
	const chartData: readonly ChartDatum[] =
		summary?.categories
			.filter(
				(category) =>
					category.type !== "REFUND" &&
					compareMoney(category.net, ZERO_AMOUNT) !== 0,
			)
			.slice(0, CHART_COLORS.length)
			.map((category, index) => ({
				label: category.categoryName,
				value: Number(absoluteMoney(category.net)),
				color: CHART_COLORS[index] ?? COLORS.primary,
			})) ?? [];

	const prevInvestmentNet = sumMoney(
		previousSummary?.investments.map((investment) => investment.net) ?? [],
	);
	const prevInvestmentCashFlow = subtractMoney(
		ZERO_AMOUNT,
		prevInvestmentNet,
	);
	const prevNetAfterInvestments = addMoney(
		previousSummary?.netProfit ?? ZERO_AMOUNT,
		prevInvestmentCashFlow,
	);

	const savingsRateNum = (() => {
		const income = Number(summary?.totalIncome ?? ZERO_AMOUNT);
		if (income === 0) return null;
		return (Number(summary?.netProfit ?? ZERO_AMOUNT) / income) * 100;
	})();

	const summaryMetrics: readonly SummaryMetricInput[] = [
		{
			label: "Income",
			value: formatMoney(
				summary?.totalIncome ?? ZERO_AMOUNT,
				DEFAULT_CURRENCY_CODE,
			),
			accent: "success",
			color: COLORS.success,
			...(previousSummary !== null
				? buildPctDisplay(
					getPercentChange(
						summary?.totalIncome ?? ZERO_AMOUNT,
						previousSummary.totalIncome,
					),
					true,
				)
				: {}),
		},
		{
			label: "Expenses",
			value: formatMoney(
				summary?.totalExpense ?? ZERO_AMOUNT,
				DEFAULT_CURRENCY_CODE,
			),
			accent: "danger",
			color: COLORS.danger,
			...(previousSummary !== null
				? buildPctDisplay(
					getPercentChange(
						summary?.totalExpense ?? ZERO_AMOUNT,
						previousSummary.totalExpense,
					),
					false,
				)
				: {}),
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
			...(previousSummary !== null
				? buildPctDisplay(
					getPercentChange(
						summary?.netProfit ?? ZERO_AMOUNT,
						previousSummary.netProfit,
					),
					true,
				)
				: {}),
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
			...(previousSummary !== null
				? buildPctDisplay(
					getPercentChange(
						netAfterInvestments,
						prevNetAfterInvestments,
					),
					true,
				)
				: {}),
		},
		{
			label: "Savings rate",
			value:
				savingsRateNum !== null
					? `${savingsRateNum.toFixed(1)}%`
					: "\u2014",
			accent:
				savingsRateNum === null || savingsRateNum < 0
					? "danger"
					: savingsRateNum >= 20
						? "success"
						: "warning",
			color:
				savingsRateNum !== null && savingsRateNum >= 0
					? COLORS.success
					: COLORS.danger,
		},
	];

	const topSpendingData: readonly BarDatum[] = useMemo(
		() =>
			summary?.categories
				.filter((category) => Number(category.debits) > 0)
				.sort((a, b) => Number(b.debits) - Number(a.debits))
				.slice(0, 8)
				.map((category) => ({
					label: category.categoryName.slice(0, 10),
					value: Number(category.debits),
					color: COLORS.danger,
				})) ?? [],
		[summary?.categories],
	);

	const trendChartData: readonly BarDatum[] = useMemo(
		() =>
			periodTrend.map((point) => ({
				label: point.label,
				value: Math.abs(Number(point.net)),
				color:
					compareMoney(point.net, ZERO_AMOUNT) >= 0
						? COLORS.success
						: COLORS.danger,
			})),
		[periodTrend],
	);

	const incomeTrendData: readonly BarDatum[] = useMemo(
		() =>
			periodTrend.map((point) => ({
				label: point.label,
				value: Number(point.income),
				color: COLORS.success,
			})),
		[periodTrend],
	);

	const expenseTrendData: readonly BarDatum[] = useMemo(
		() =>
			periodTrend.map((point) => ({
				label: point.label,
				value: Math.abs(Number(point.expense)),
				color: COLORS.danger,
			})),
		[periodTrend],
	);

	const investmentTrendData: readonly BarDatum[] = useMemo(
		() =>
			periodTrend.map((point) => {
				const income = Number(point.income);
				const net = Number(point.net);
				const investmentValue = income - net;
				return {
					label: point.label,
					value: Math.max(0, investmentValue),
					color: "#60A5FA",
				};
			}),
		[periodTrend],
	);

	const netWorthTrendData: readonly BarDatum[] = useMemo(
		() =>
			periodTrend.map((point) => ({
				label: point.label,
				value: Number(point.net),
				color:
					compareMoney(point.net, ZERO_AMOUNT) >= 0
						? COLORS.success
						: COLORS.danger,
			})),
		[periodTrend],
	);

	const renderMetric = (metric: SummaryMetricInput): React.JSX.Element => (
		<View key={metric.label} style={styles.summaryTile}>
			<GlassCard accent={metric.accent}>
				<CustomText style={styles.summaryLabel}>
					{metric.label}
				</CustomText>
				<CustomText
					style={[styles.summaryValue, { color: metric.color }]}
				>
					{metric.value}
				</CustomText>
				{metric.pctText ? (
					<CustomText
						style={[
							styles.summaryPct,
							{ color: metric.pctColor ?? COLORS.textMuted },
						]}
					>
						{metric.pctText} vs prev
					</CustomText>
				) : null}
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
						accessibilityLabel="Previous period"
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
						accessibilityLabel="Next period"
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
			{period === "ALL" ? (
				<Notice message="Showing every transaction and category stored locally." />
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
					message={`Update INR exchange rates for ${summary.missingCurrencies.join(", ")} before analysis can include those transactions.`}
					tone="warning"
				/>
			) : null}
			{error ? <Notice message={error} tone="danger" /> : null}
			<View style={styles.summaryGrid}>
				{summaryMetrics.map(renderMetric)}
			</View>
			{trendChartData.length > 0 ? (
				period === "ALL" ? (
					<View style={styles.carouselWrapper}>
						<View style={styles.carouselHeader}>
							<Pressable
								onPress={() =>
									setCarouselIndex(
										Math.max(0, carouselIndex - 1),
									)
								}
								disabled={carouselIndex === 0}
								style={[
									styles.carouselButton,
									carouselIndex === 0 &&
									styles.carouselButtonDisabled,
								]}
							>
								<Ionicons
									name="chevron-back"
									size={24}
									color={
										carouselIndex === 0
											? COLORS.textDim
											: COLORS.text
									}
								/>
							</Pressable>
							<CustomText style={styles.carouselIndicator}>
								{carouselIndex + 1} / 4
							</CustomText>
							<Pressable
								onPress={() =>
									setCarouselIndex(
										Math.min(3, carouselIndex + 1),
									)
								}
								disabled={carouselIndex === 3}
								style={[
									styles.carouselButton,
									carouselIndex === 3 &&
									styles.carouselButtonDisabled,
								]}
							>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={
										carouselIndex === 3
											? COLORS.textDim
											: COLORS.text
									}
								/>
							</Pressable>
						</View>
						<GlassCard style={styles.carouselCard}>
							{carouselIndex === 0 && (
								<BarChart
									data={incomeTrendData}
									title="Income Trend"
								/>
							)}
							{carouselIndex === 1 && (
								<BarChart
									data={expenseTrendData}
									title="Expense Trend"
								/>
							)}
							{carouselIndex === 2 && (
								<BarChart
									data={investmentTrendData}
									title="Investment Trend"
								/>
							)}
							{carouselIndex === 3 && (
								<BarChart
									data={netWorthTrendData}
									title="Net Worth Trend"
								/>
							)}
						</GlassCard>
					</View>
				) : (
					<GlassCard>
						<BarChart data={trendChartData} title="Trend" />
					</GlassCard>
				)
			) : null}
			{yoySummary !== null ? (
				<>
					<SectionHeading
						subtitle="Compared to the same period last year."
						title="Year over year"
					/>
					<GlassCard>
						{(
							[
								{
									label: "Income",
									current:
										summary?.totalIncome ?? ZERO_AMOUNT,
									previous: yoySummary.totalIncome,
									higherIsBetter: true,
								},
								{
									label: "Expenses",
									current:
										summary?.totalExpense ?? ZERO_AMOUNT,
									previous: yoySummary.totalExpense,
									higherIsBetter: false,
								},
								{
									label: "Net",
									current: summary?.netProfit ?? ZERO_AMOUNT,
									previous: yoySummary.netProfit,
									higherIsBetter: true,
								},
							] as const
						).map(
							({ label, current, previous, higherIsBetter }) => {
								const { pctText, pctColor } = buildPctDisplay(
									getPercentChange(current, previous),
									higherIsBetter,
								);
								return (
									<View key={label} style={styles.yoyRow}>
										<CustomText style={styles.summaryLabel}>
											{label}
										</CustomText>
										<View style={styles.yoyRight}>
											<CustomText
												style={[
													styles.yoyPct,
													{ color: pctColor },
												]}
											>
												{pctText}
											</CustomText>
											<CustomText
												style={styles.yoyPrevValue}
											>
												vs{" "}
												{formatMoney(
													previous,
													DEFAULT_CURRENCY_CODE,
												)}
											</CustomText>
										</View>
									</View>
								);
							},
						)}
					</GlassCard>
				</>
			) : null}
			<SectionHeading
				subtitle="Highest-spend categories in the selected period."
				title="Top spending"
			/>
			<GlassCard>
				<BarChart
					data={topSpendingData}
					formatValue={(value) =>
						formatMoney(value.toFixed(2), DEFAULT_CURRENCY_CODE)
					}
					title="Top spending categories"
				/>
			</GlassCard>
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
			{summary?.categories.map((category) => (
				<Pressable
					key={`${category.categoryId}:${category.currencyCode}`}
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: "CATEGORY",
							entityId: category.categoryId,
							entityName: category.categoryName,
							dateRangeStart: dateRange.start,
							dateRangeEnd: dateRange.end,
							dateRangeLabel: getDateRangeLabel(
								period,
								dateRange,
							),
						})
					}
				>
					<GlassCard
						accent={
							compareMoney(category.net, ZERO_AMOUNT) >= 0
								? "success"
								: "danger"
						}
					>
						<View style={styles.categoryRow}>
							<View style={styles.categoryDetails}>
								<CustomText style={styles.categoryName}>
									{category.categoryName}
								</CustomText>
								<CustomText style={styles.categoryBucket}>
									{category.type === "INCOME"
										? "Income category"
										: category.type === "REFUND"
											? "Refund category"
											: "Expense category"}
								</CustomText>
								<CustomText style={styles.categoryBreakdown}>
									Credits{" "}
									{formatMoney(
										category.credits,
										category.currencyCode,
									)}
									{" · "}Debits{" "}
									{formatMoney(
										category.debits,
										category.currencyCode,
									)}
								</CustomText>
							</View>
							<View style={styles.categoryRight}>
								<CustomText
									style={[
										styles.categoryNet,
										{
											color:
												compareMoney(
													category.net,
													ZERO_AMOUNT,
												) >= 0
													? COLORS.success
													: COLORS.danger,
										},
									]}
								>
									{formatMoney(
										category.net,
										category.currencyCode,
									)}
								</CustomText>
								<Ionicons
									color={COLORS.textDim}
									name="chevron-forward"
									size={14}
								/>
							</View>
						</View>
					</GlassCard>
				</Pressable>
			))}
			<SectionHeading
				subtitle="Investment transactions stay separate from income and expenses."
				title="Investments"
			/>
			{summary?.investments.length ? (
				summary.investments.map((investment) => (
					<Pressable
						key={`${investment.investmentId}:${investment.currencyCode}`}
						onPress={() =>
							navigation.navigate("LinkedTransactions", {
								kind: "INVESTMENT",
								entityId: investment.investmentId,
								entityName: investment.investmentName,
								dateRangeStart: dateRange.start,
								dateRangeEnd: dateRange.end,
								dateRangeLabel: getDateRangeLabel(
									period,
									dateRange,
								),
							})
						}
					>
						<GlassCard accent={getInvestmentAccent(investment.net)}>
							<CustomText style={styles.categoryName}>
								{investment.investmentName}
							</CustomText>
							<View style={styles.investmentRow}>
								<View>
									<CustomText style={styles.summaryLabel}>
										Total invested
									</CustomText>
									<CustomText style={styles.investmentValue}>
										{formatMoney(
											investment.totalInvested,
											investment.currencyCode,
										)}
									</CustomText>
								</View>
								<View>
									<CustomText style={styles.summaryLabel}>
										Total redeemed
									</CustomText>
									<CustomText style={styles.investmentValue}>
										{formatMoney(
											investment.totalRedeemed,
											investment.currencyCode,
										)}
									</CustomText>
								</View>
							</View>
							<CustomText
								style={[
									styles.investmentNet,
									{
										color: getInvestmentColor(
											investment.net,
										),
									},
								]}
							>
								{getInvestmentNetLabel(investment.net)}:{" "}
								{formatMoney(
									getInvestmentNetAmount(investment.net),
									investment.currencyCode,
								)}
							</CustomText>
						</GlassCard>
					</Pressable>
				))
			) : (
				<EmptyState
					icon="trending-up"
					message="No investment transactions in this period."
					title="No investment activity"
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
	summaryPct: {
		fontSize: 11,
		fontWeight: "700",
		marginTop: 3,
	},
	categoryRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	categoryDetails: {
		flex: 1,
		gap: 3,
	},
	categoryRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	categoryName: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
	},
	categoryBucket: {
		color: COLORS.primaryBright,
		fontSize: 11,
		fontWeight: "700",
	},
	categoryBreakdown: {
		color: COLORS.textMuted,
		fontSize: 11,
		lineHeight: 16,
	},
	categoryNet: {
		fontSize: 14,
		fontWeight: "900",
		textAlign: "right",
	},
	investmentRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 12,
		gap: 16,
	},
	investmentValue: {
		color: COLORS.text,
		fontSize: 14,
		fontWeight: "900",
		marginTop: 4,
	},
	investmentNet: {
		fontSize: 12,
		fontWeight: "900",
		marginTop: 10,
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
	yoyRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 6,
	},
	yoyRight: {
		alignItems: "flex-end",
	},
	yoyPct: {
		fontSize: 14,
		fontWeight: "900",
	},
	yoyPrevValue: {
		color: COLORS.textMuted,
		fontSize: 11,
		marginTop: 2,
	},
	carouselContainer: {
		gap: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	carouselCard: {
		minWidth: 360,
	},
	carouselWrapper: {
		gap: 10,
	},
	carouselHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
	},
	carouselButton: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: "rgba(255,255,255,0.08)",
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: "center",
		justifyContent: "center",
	},
	carouselButtonDisabled: {
		opacity: 0.4,
	},
	carouselIndicator: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
});

export default AnalysisScreen;
