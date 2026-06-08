import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DateField } from "@/components/DateField";
import { DonutChart } from "@/components/DonutChart";
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeading } from "@/components/SectionHeading";
import { SegmentedControl } from "@/components/SegmentedControl";
import { DEFAULT_CURRENCY_CODE } from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
} from "@/services/analysisService";
import type { AnalysisPeriod } from "@/types/AnalysisPeriod";
import type { AnalysisSummary } from "@/types/AnalysisSummary";
import type { ChartDatum } from "@/types/ChartDatum";
import type { DateRange } from "@/types/DateRange";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { SelectOption } from "@/types/SelectOption";
import {
	formatDate,
	getAnalysisDateRange,
	getCustomDateRange,
	shiftAnalysisAnchor,
} from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import {
	absoluteMoney,
	addMoney,
	compareMoney,
	formatMoney,
	subtractMoney,
	sumMoney,
	ZERO_AMOUNT,
} from "@/utils/money";

type AnalysisScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Analysis"
>;

type AnalysisDateRangeInput = Readonly<{
	period: AnalysisPeriod;
	anchorDate: Date;
	customStartAt: number;
	customEndAt: number;
}>;

type SummaryMetricInput = Readonly<{
	label: string;
	value: string;
	accent: "success" | "danger" | "warning" | "default";
	color: string;
}>;

const PERIOD_OPTIONS: readonly SelectOption[] = [
	{ label: "Month", value: "MONTH" },
	{ label: "Year", value: "YEAR" },
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
}: AnalysisDateRangeInput): DateRange => {
	if (period === "CUSTOM") {
		return getCustomDateRange(customStartAt, customEndAt);
	}
	return getAnalysisDateRange(period, anchorDate);
};

const getPeriodTitle = (period: AnalysisPeriod, anchorDate: Date): string => {
	if (period === "MONTH") {
		return anchorDate.toLocaleString("en-IN", {
			month: "long",
			year: "numeric",
		});
	}
	if (period === "YEAR") {
		return String(anchorDate.getFullYear());
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
	if (comparison > 0) {
		return COLORS.danger;
	}
	if (comparison < 0) {
		return COLORS.success;
	}
	return COLORS.text;
};

const getInvestmentAccent = (net: string): "success" | "danger" | "default" => {
	const comparison = compareMoney(net, ZERO_AMOUNT);
	if (comparison > 0) {
		return "danger";
	}
	if (comparison < 0) {
		return "success";
	}
	return "default";
};

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

	const dateRange = useMemo(
		() =>
			getSelectedDateRange({
				period,
				anchorDate,
				customStartAt,
				customEndAt,
			}),
		[anchorDate, customEndAt, customStartAt, period],
	);

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setSummary(
				await getAnalysisSummary(database, {
					dateRange,
					isNativeCurrency: false,
				}),
			);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, dateRange]);

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const handlePeriodChange = (value: string): void => {
		if (value === "YEAR" || value === "ALL" || value === "CUSTOM") {
			setPeriod(value);
			return;
		}
		setPeriod("MONTH");
	};

	const hasMissingCurrencies = Boolean(summary?.missingCurrencies.length);
	const investmentNet = sumMoney(
		summary?.investments.map((investment) => investment.net) ?? [],
	);
	const investmentCashFlow = subtractMoney(ZERO_AMOUNT, investmentNet);
	const netAfterInvestments = addMoney(
		summary?.netProfit ?? ZERO_AMOUNT,
		investmentCashFlow,
	);
	const chartData: readonly ChartDatum[] = hasMissingCurrencies
		? []
		: (summary?.categories
				.filter(
					(category) => compareMoney(category.net, ZERO_AMOUNT) !== 0,
				)
				.slice(0, CHART_COLORS.length)
				.map((category, index) => ({
					label: category.categoryName,
					value: Number(absoluteMoney(category.net)),
					color: CHART_COLORS[index] ?? COLORS.primary,
				})) ?? []);
	const summaryMetrics: readonly SummaryMetricInput[] = [
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
			{period === "MONTH" || period === "YEAR" ? (
				<View style={styles.periodRow}>
					<Pressable
						onPress={() =>
							setAnchorDate(
								shiftAnalysisAnchor(period, anchorDate, -1),
							)
						}
						style={styles.periodButton}
					>
						<Ionicons
							color={COLORS.text}
							name="chevron-back"
							size={21}
						/>
					</Pressable>
					<View style={styles.periodText}>
						<CustomText style={styles.periodTitle}>
							{getPeriodTitle(period, anchorDate)}
						</CustomText>
						<CustomText style={styles.periodRange}>
							{formatDate(dateRange.start)} -{" "}
							{formatDate(dateRange.end)}
						</CustomText>
					</View>
					<Pressable
						onPress={() =>
							setAnchorDate(
								shiftAnalysisAnchor(period, anchorDate, 1),
							)
						}
						style={styles.periodButton}
					>
						<Ionicons
							color={COLORS.text}
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
							{formatDate(dateRange.start)} -{" "}
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
						<GlassCard
							accent={
								compareMoney(category.net, ZERO_AMOUNT) >= 0
									? "success"
									: "danger"
							}
							key={`${category.categoryId}:${category.currencyCode}`}
						>
							<View style={styles.categoryRow}>
								<View style={styles.categoryDetails}>
									<CustomText style={styles.categoryName}>
										{category.categoryName}
									</CustomText>
									<CustomText style={styles.categoryBucket}>
										{category.isIncome
											? "Income category"
											: "Expense category"}
									</CustomText>
									<CustomText
										style={styles.categoryBreakdown}
									>
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
							</View>
						</GlassCard>
					))}
					<SectionHeading
						subtitle="Investment transactions stay separate from income and expenses."
						title="Investments"
					/>
					{summary?.investments.length ? (
						summary.investments.map((investment) => (
							<GlassCard
								accent={getInvestmentAccent(investment.net)}
								key={`${investment.investmentId}:${investment.currencyCode}`}
							>
								<CustomText style={styles.categoryName}>
									{investment.investmentName}
								</CustomText>
								<View style={styles.investmentRow}>
									<View>
										<CustomText style={styles.summaryLabel}>
											Total invested
										</CustomText>
										<CustomText
											style={styles.investmentValue}
										>
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
										<CustomText
											style={styles.investmentValue}
										>
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
		gap: 10,
	},
	summaryTile: {
		width: "48.5%",
	},
	summaryLabel: {
		color: COLORS.textMuted,
		fontSize: 11,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: 0.7,
	},
	summaryValue: {
		fontSize: 18,
		fontWeight: "900",
		marginTop: 5,
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
});

export { AnalysisScreen };
