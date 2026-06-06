import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CurrencyToggle } from "@/components/CurrencyToggle";
import { DonutChart } from "@/components/DonutChart";
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeading } from "@/components/SectionHeading";
import { SegmentedControl } from "@/components/SegmentedControl";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	buildCategoryCurrencySummaries,
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
} from "@/services/analysisService";
import {
	getNativeCurrencyDisplay,
	updateNativeCurrencyDisplay,
} from "@/services/settingsService";
import type { AnalysisPeriod } from "@/types/AnalysisPeriod";
import type { AnalysisSummary } from "@/types/AnalysisSummary";
import type { CategoryCurrencySummary } from "@/types/CategoryCurrencySummary";
import type { ChartDatum } from "@/types/ChartDatum";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { SelectOption } from "@/types/SelectOption";
import {
	formatDate,
	getAnalysisDateRange,
	shiftAnalysisAnchor,
} from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import {
	absoluteMoney,
	compareMoney,
	formatMoney,
	ZERO_AMOUNT,
} from "@/utils/money";

type AnalysisScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Analysis"
>;

const PERIOD_OPTIONS: readonly SelectOption[] = [
	{ label: "Month", value: "MONTH" },
	{ label: "Year", value: "YEAR" },
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

const getDisplayCurrencySummaries = (
	summary: AnalysisSummary | null,
	isNativeCurrency: boolean,
): readonly CategoryCurrencySummary[] => {
	if (!summary) {
		return [];
	}
	if (isNativeCurrency) {
		return buildCategoryCurrencySummaries(summary.categories);
	}
	return [
		{
			currencyCode: "INR",
			totalIncome: summary.totalIncome,
			totalExpense: summary.totalExpense,
			netProfit: summary.netProfit,
		},
	];
};

const AnalysisScreen = ({
	navigation,
}: AnalysisScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [period, setPeriod] = useState<AnalysisPeriod>("MONTH");
	const [anchorDate, setAnchorDate] = useState(new Date());
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [summary, setSummary] = useState<AnalysisSummary | null>(null);
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const nativeCurrency = await getNativeCurrencyDisplay(database);
			setIsNativeCurrency(nativeCurrency);
			setSummary(
				await getAnalysisSummary(database, {
					dateRange: getAnalysisDateRange(period, anchorDate),
					isNativeCurrency: nativeCurrency,
				}),
			);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [anchorDate, database, period]);

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const handlePeriodChange = (value: string): void => {
		setPeriod(value === "YEAR" ? "YEAR" : "MONTH");
	};

	const handleToggleCurrency = async (): Promise<void> => {
		const nextValue = !isNativeCurrency;
		await updateNativeCurrencyDisplay(database, nextValue);
		setIsNativeCurrency(nextValue);
		setSummary(
			await getAnalysisSummary(database, {
				dateRange: getAnalysisDateRange(period, anchorDate),
				isNativeCurrency: nextValue,
			}),
		);
	};

	const dateRange = getAnalysisDateRange(period, anchorDate);
	const chartData: readonly ChartDatum[] = !isNativeCurrency
		? (summary?.categories
				.filter(
					(category) => compareMoney(category.net, ZERO_AMOUNT) !== 0,
				)
				.slice(0, CHART_COLORS.length)
				.map((category, index) => ({
					label: category.categoryName,
					value: Number(absoluteMoney(category.net)),
					color: CHART_COLORS[index] ?? COLORS.primary,
				})) ?? [])
		: [];
	const currencySummaries = getDisplayCurrencySummaries(
		summary,
		isNativeCurrency,
	);
	const netAccent = currencySummaries.some(
		(currencySummary) =>
			compareMoney(currencySummary.netProfit, ZERO_AMOUNT) < 0,
	)
		? "danger"
		: "success";

	return (
		<ScreenContainer>
			<SegmentedControl
				onChange={handlePeriodChange}
				options={PERIOD_OPTIONS}
				value={period}
			/>
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
					<Text style={styles.periodTitle}>
						{period === "MONTH"
							? anchorDate.toLocaleString("en-IN", {
									month: "long",
									year: "numeric",
								})
							: String(anchorDate.getFullYear())}
					</Text>
					<Text style={styles.periodRange}>
						{formatDate(dateRange.start)} –{" "}
						{formatDate(dateRange.end)}
					</Text>
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
			<CurrencyToggle
				isNativeCurrency={isNativeCurrency}
				onToggle={() => void handleToggleCurrency()}
			/>
			{summary?.missingCurrencies.length ? (
				<Notice
					message={`Missing INR rates: ${summary.missingCurrencies.join(", ")}. Set rates before relying on converted totals.`}
					tone="warning"
				/>
			) : null}
			{error ? <Notice message={error} tone="danger" /> : null}
			<View style={styles.summaryGrid}>
				<GlassCard accent="success">
					<Text style={styles.summaryLabel}>Income</Text>
					<Text
						style={[styles.summaryValue, { color: COLORS.success }]}
					>
						{currencySummaries.length
							? currencySummaries.map((currencySummary) => (
									<Text key={currencySummary.currencyCode}>
										{formatMoney(
											currencySummary.totalIncome,
											currencySummary.currencyCode,
										)}
										{"\n"}
									</Text>
								))
							: formatMoney(ZERO_AMOUNT, "INR")}
					</Text>
				</GlassCard>
				<GlassCard accent="danger">
					<Text style={styles.summaryLabel}>Expenses</Text>
					<Text
						style={[styles.summaryValue, { color: COLORS.danger }]}
					>
						{currencySummaries.length
							? currencySummaries.map((currencySummary) => (
									<Text key={currencySummary.currencyCode}>
										{formatMoney(
											currencySummary.totalExpense,
											currencySummary.currencyCode,
										)}
										{"\n"}
									</Text>
								))
							: formatMoney(ZERO_AMOUNT, "INR")}
					</Text>
				</GlassCard>
			</View>
			<GlassCard accent={netAccent}>
				<Text style={styles.summaryLabel}>Net profit</Text>
				<Text style={styles.netProfit}>
					{currencySummaries.length
						? currencySummaries.map((currencySummary) => (
								<Text key={currencySummary.currencyCode}>
									{formatMoney(
										currencySummary.netProfit,
										currencySummary.currencyCode,
									)}
									{"\n"}
								</Text>
							))
						: formatMoney(ZERO_AMOUNT, "INR")}
				</Text>
				<Text style={styles.formula}>
					Income category nets − expense category nets
				</Text>
			</GlassCard>
			<SectionHeading
				subtitle="Credits minus debits for every category. Classification decides the analysis bucket."
				title="Category net"
			/>
			{isNativeCurrency ? (
				<Notice
					message="Switch the world toggle off to compare categories in one INR chart. Native currencies are kept separate."
					tone="info"
				/>
			) : chartData.length ? (
				<GlassCard>
					<DonutChart
						centerLabel={formatMoney(
							summary?.netProfit ?? ZERO_AMOUNT,
							"INR",
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
							<Text style={styles.categoryName}>
								{category.categoryName}
							</Text>
							<Text style={styles.categoryBucket}>
								{category.isIncome
									? "Income category"
									: "Expense category"}
							</Text>
							<Text style={styles.categoryBreakdown}>
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
							</Text>
						</View>
						<Text
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
							{formatMoney(category.net, category.currencyCode)}
						</Text>
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
						key={`${investment.investmentId}:${investment.currencyCode}`}
					>
						<Text style={styles.categoryName}>
							{investment.investmentName}
						</Text>
						<View style={styles.investmentRow}>
							<View>
								<Text style={styles.summaryLabel}>
									Total invested
								</Text>
								<Text style={styles.investmentValue}>
									{formatMoney(
										investment.totalInvested,
										investment.currencyCode,
									)}
								</Text>
							</View>
							<View>
								<Text style={styles.summaryLabel}>
									Total redeemed
								</Text>
								<Text style={styles.investmentValue}>
									{formatMoney(
										investment.totalRedeemed,
										investment.currencyCode,
									)}
								</Text>
							</View>
						</View>
						<Text style={styles.formula}>
							{getInvestmentNetLabel(investment.net)}:{" "}
							{formatMoney(
								getInvestmentNetAmount(investment.net),
								investment.currencyCode,
							)}
						</Text>
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
				<Text style={styles.ratesLinkText}>Manage exchange rates</Text>
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
	summaryGrid: {
		flexDirection: "row",
		gap: 10,
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
	netProfit: {
		color: COLORS.text,
		fontSize: 25,
		fontWeight: "900",
		marginTop: 5,
	},
	formula: {
		color: COLORS.textMuted,
		fontSize: 11,
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
