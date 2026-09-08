import CustomText from "@/components/CustomText";
import EmptyState from "@/components/EmptyState";
import GlassCard from "@/components/GlassCard";
import ScreenList from "@/components/ScreenList";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import analysisService from "@/services/analysisService";
import type AnalysisDetailsScreenProps from "@/types/AnalysisDetailsScreenProps";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type CategoryAnalysis from "@/types/CategoryAnalysis";
import type InvestmentAnalysis from "@/types/InvestmentAnalysis";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const { getAnalysisSummary, getInvestmentNetAmount, getInvestmentNetLabel } =
	analysisService;
const { compareMoney, formatMoney, subtractMoney, ZERO_AMOUNT } = moneyUtils;

const getCategoryAccent = (net: string): "success" | "danger" =>
	compareMoney(net, ZERO_AMOUNT) >= 0 ? "success" : "danger";

const getCategoryNetColor = (net: string): string =>
	compareMoney(net, ZERO_AMOUNT) >= 0 ? COLORS.success : COLORS.danger;

const getInvestmentAccent = (net: string): "success" | "danger" | "default" => {
	const comparison = compareMoney(net, ZERO_AMOUNT);
	if (comparison > 0) return "danger";
	if (comparison < 0) return "success";
	/* v8 ignore next */
	return "default";
};

const getInvestmentColor = (net: string): string => {
	const comparison = compareMoney(net, ZERO_AMOUNT);
	if (comparison > 0) return COLORS.danger;
	if (comparison < 0) return COLORS.success;
	return COLORS.text;
};

const getCategoryBreakdownText = (category: CategoryAnalysis): string =>
	`Credits ${formatMoney(category.credits, category.currencyCode)} · Debits ${formatMoney(category.debits, category.currencyCode)}`;

const getInvestmentNetText = (net: string, currencyCode: string): string =>
	`${getInvestmentNetLabel(net)}: ${formatMoney(getInvestmentNetAmount(net), currencyCode)}`;

const resolveDetailsView = (
	mode: "CATEGORIES" | "INVESTMENTS",
	summary: AnalysisSummary | null,
	error: string,
): {
	type: "error" | "empty" | "list";
	items: Array<CategoryAnalysis | InvestmentAnalysis>;
	emptyMessage: string;
	emptyTitle: string;
	errorMessage: string;
} => {
	if (error) {
		return {
			type: "error",
			items: [],
			emptyMessage: "",
			emptyTitle: "",
			errorMessage: error,
		};
	}

	const items =
		mode === "CATEGORIES"
			? (summary?.categories ?? [])
			: (summary?.investments ?? []);
	if (!items.length) {
		return {
			type: "empty",
			items: [],
			emptyMessage:
				mode === "CATEGORIES"
					? "No categories in this period."
					: "No investment activity in this period.",
			emptyTitle:
				mode === "CATEGORIES"
					? "Nothing to analyse"
					: "No investment activity",
			errorMessage: "",
		};
	}

	return {
		type: "list",
		items,
		emptyMessage: "",
		emptyTitle: "",
		errorMessage: "",
	};
};

const AnalysisDetailsScreen = ({
	navigation,
	route,
}: AnalysisDetailsScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const { mode, dateRangeStart, dateRangeEnd, dateRangeLabel } = route.params;
	const [summary, setSummary] = useState<AnalysisSummary | null>(null);
	const [error, setError] = useState("");

	/* v8 ignore next */
	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const nextDateRange = {
				start: dateRangeStart ?? 0,
				end: dateRangeEnd ?? 8_640_000_000_000_000,
			};
			const nextSummary = await getAnalysisSummary(database, {
				dateRange: nextDateRange,
				isNativeCurrency: false,
			});
			setSummary(nextSummary);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, dateRangeEnd, dateRangeStart]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	const view = useMemo(
		() => resolveDetailsView(mode, summary, error),
		[error, mode, summary],
	);
	const items = view.items;

	/* v8 ignore next */
	const renderItem = useCallback(
		({
			item,
		}: {
			item: CategoryAnalysis | InvestmentAnalysis;
		}): React.JSX.Element => {
			if (mode === "CATEGORIES") {
				const category = item as CategoryAnalysis;
				return (
					<Pressable
						key={`${category.categoryId}:${category.currencyCode}`}
						onPress={() =>
							navigation.navigate("LinkedTransactions", {
								kind: "CATEGORY",
								entityId: category.categoryId,
								entityName: category.categoryName,
								dateRangeStart: dateRangeStart ?? 0,
								dateRangeEnd:
									dateRangeEnd ?? 8_640_000_000_000_000,
								dateRangeLabel: dateRangeLabel ?? "",
							})
						}
					>
						<GlassCard accent={getCategoryAccent(category.net)}>
							<View style={styles.row}>
								<View style={styles.details}>
									<CustomText style={styles.name}>
										{category.categoryName}
									</CustomText>
									<CustomText style={styles.meta}>
										{category.isIncome
											? "Income category"
											: "Expense category"}
									</CustomText>
									<CustomText style={styles.meta}>
										{getCategoryBreakdownText(category)}
									</CustomText>
								</View>
								<View style={styles.right}>
									<CustomText
										style={[
											styles.net,
											{
												color: getCategoryNetColor(
													category.net,
												),
											},
										]}
									>
										{formatMoney(
											category.net,
											category.currencyCode,
										)}
									</CustomText>
									<CustomText style={styles.chevron}>
										›
									</CustomText>
								</View>
							</View>
						</GlassCard>
					</Pressable>
				);
			}
			const investment = item as InvestmentAnalysis;
			return (
				<Pressable
					key={`${investment.investmentId}:${investment.currencyCode}`}
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: "INVESTMENT",
							entityId: investment.investmentId,
							entityName: investment.investmentName,
							dateRangeStart: dateRangeStart ?? 0,
							dateRangeEnd: dateRangeEnd ?? 8_640_000_000_000_000,
							dateRangeLabel: dateRangeLabel ?? "",
						})
					}
				>
					<GlassCard accent={getInvestmentAccent(investment.net)}>
						<View style={styles.investmentCard}>
							<CustomText style={styles.name}>
								{investment.investmentName}
							</CustomText>
							<View style={styles.detailsRow}>
								<View>
									<CustomText style={styles.meta}>
										Total invested
									</CustomText>
									<CustomText style={styles.value}>
										{formatMoney(
											investment.totalInvested,
											investment.currencyCode,
										)}
									</CustomText>
								</View>
								<View>
									<CustomText style={styles.meta}>
										Total redeemed
									</CustomText>
									<CustomText style={styles.value}>
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
								{getInvestmentNetText(
									investment.net,
									investment.currencyCode,
								)}
							</CustomText>
						</View>
					</GlassCard>
				</Pressable>
			);
		},
		[dateRangeEnd, dateRangeLabel, dateRangeStart, mode, navigation],
	);

	return (
		<View style={styles.screen}>
			{view.type === "error" ? (
				<CustomText style={styles.error}>
					{view.errorMessage}
				</CustomText>
			) : null}
			{view.type === "list" ? (
				<ScreenList
					data={items}
					keyExtractor={(
						item: CategoryAnalysis | InvestmentAnalysis,
					) =>
						mode === "CATEGORIES"
							? `${(item as CategoryAnalysis).categoryId}:${(item as CategoryAnalysis).currencyCode}`
							: `${(item as InvestmentAnalysis).investmentId}:${(item as InvestmentAnalysis).currencyCode}`
					}
					renderItem={renderItem}
				/>
			) : null}
			{view.type === "empty" ? (
				<EmptyState
					icon={
						mode === "CATEGORIES"
							? "pie-chart-outline"
							: "trending-up"
					}
					message={view.emptyMessage}
					title={view.emptyTitle}
				/>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
		padding: 12,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	details: {
		flex: 1,
		gap: 3,
	},
	right: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	name: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 11,
		lineHeight: 16,
	},
	net: {
		fontSize: 14,
		fontWeight: "900",
		textAlign: "right",
	},
	chevron: {
		color: COLORS.textDim,
		fontSize: 18,
	},
	investmentCard: {
		gap: 10,
	},
	detailsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 16,
	},
	value: {
		color: COLORS.text,
		fontSize: 14,
		fontWeight: "900",
		marginTop: 4,
	},
	investmentNet: {
		fontSize: 12,
		fontWeight: "900",
		marginTop: 6,
	},
	error: {
		color: COLORS.danger,
		fontWeight: "700",
		marginBottom: 12,
	},
});

export {
	getCategoryAccent,
	getCategoryBreakdownText,
	getCategoryNetColor,
	getInvestmentAccent,
	getInvestmentColor,
	getInvestmentNetText,
	resolveDetailsView,
};

export default AnalysisDetailsScreen;
