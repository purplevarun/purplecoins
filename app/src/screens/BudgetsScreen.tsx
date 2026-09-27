import CustomText from "@/components/CustomText";
import type ListItemProps from "@/types/ListItemProps";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import analysisService from "@/services/analysisService";
import budgetService from "@/services/budgetService";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type Budget from "@/types/Budget";
import type BudgetsScreenProps from "@/types/BudgetsScreenProps";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";
const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getAnalysisSummary } = analysisService;
const { deleteBudget, getBudgets } = budgetService;
const { getAnalysisDateRange } = dateUtils;
const { compareMoney, formatMoney, subtractMoney, ZERO_AMOUNT } = moneyUtils;

const BudgetsScreen = ({
	navigation,
}: BudgetsScreenProps): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [budgets, setBudgets] = useState<readonly Budget[]>([]);
	const [monthlyAnalysis, setMonthlyAnalysis] =
		useState<AnalysisSummary | null>(null);
	const [yearlyAnalysis, setYearlyAnalysis] =
		useState<AnalysisSummary | null>(null);
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const now = new Date();
			const [loadedBudgets, monthSummary, yearSummary] =
				await Promise.all([
					getBudgets(database),
					getAnalysisSummary(database, {
						dateRange: getAnalysisDateRange("MONTH", now),
						isNativeCurrency: false,
					}),
					getAnalysisSummary(database, {
						dateRange: getAnalysisDateRange("YEAR", now),
						isNativeCurrency: false,
					}),
				]);
			setBudgets(loadedBudgets);
			setMonthlyAnalysis(monthSummary);
			setYearlyAnalysis(yearSummary);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	const getSpent = useCallback(
		(budget: Budget): string => {
			const summary =
				budget.period === "MONTHLY" ? monthlyAnalysis : yearlyAnalysis;
			const rows =
				summary?.categories.filter(
					(category) =>
						category.categoryId === budget.categoryId &&
						category.currencyCode === DEFAULT_CURRENCY_CODE,
				) ?? [];
			const netSpent = rows.reduce(
				(total, row) =>
					subtractMoney(
						total,
						subtractMoney(row.credits, row.debits),
					),
				ZERO_AMOUNT,
			);
			return compareMoney(netSpent, ZERO_AMOUNT) > 0
				? netSpent
				: ZERO_AMOUNT;
		},
		[monthlyAnalysis, yearlyAnalysis],
	);

	const handleDelete = useCallback(
		(budget: Budget): void => {
			dialog.confirm({
				title: "Delete budget?",
				message: budget.categoryName,
				confirmLabel: "Delete",
				variant: "danger",
				onConfirm: () => {
					const processDelete = async (): Promise<void> => {
						try {
							await deleteBudget(database, budget.id);
							refreshData();
						} catch (caughtError: unknown) {
							dialog.showMessage({
								title: "Unable to delete",
								message: getErrorMessage(caughtError),
								variant: "danger",
							});
						}
					};
					void processDelete();
				},
			});
		},
		[database, dialog, refreshData],
	);

	const renderBudget = useCallback(
		({ item: budget }: ListItemProps<Budget>): React.JSX.Element => {
			const spent = getSpent(budget);
			const rawProgress =
				Number(spent) / Math.max(Number(budget.amount), 1);
			const progress = Math.min(Math.max(rawProgress, 0), 1);
			const isOverBudget = compareMoney(spent, budget.amount) > 0;
			return (
				<GlassCard accent={isOverBudget ? "danger" : "default"}>
					<View style={styles.headingRow}>
						<View style={styles.details}>
							<CustomText style={styles.title}>
								{budget.categoryName}
							</CustomText>
							<CustomText style={styles.period}>
								{budget.period === "MONTHLY"
									? "Calendar month"
									: "Calendar year"}
							</CustomText>
						</View>
						<CustomText
							style={[
								styles.percentage,
								isOverBudget && styles.overBudget,
							]}
						>
							{Math.round(rawProgress * 100)}%
						</CustomText>
					</View>
					<View style={styles.progressTrack}>
						<View
							style={[
								styles.progressFill,
								{
									width: `${progress * 100}%`,
									backgroundColor: isOverBudget
										? COLORS.danger
										: COLORS.primary,
								},
							]}
						/>
					</View>
					<CustomText style={styles.amounts}>
						{formatMoney(spent, DEFAULT_CURRENCY_CODE)} of{" "}
						{formatMoney(budget.amount, DEFAULT_CURRENCY_CODE)}
					</CustomText>
					<View style={styles.actions}>
						<AppButton
							icon="create-outline"
							isCompact
							label="Edit"
							onPress={() =>
								navigation.navigate("BudgetForm", {
									budgetId: budget.id,
								})
							}
							variant="secondary"
						/>
						<AppButton
							icon="trash-outline"
							isCompact
							label="Delete"
							onPress={() => handleDelete(budget)}
							variant="danger"
						/>
					</View>
				</GlassCard>
			);
		},
		[getSpent, handleDelete, navigation],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<Notice message="Budgets use INR and reset on calendar month or calendar year boundaries." />
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="speedometer-outline"
				message="Set a monthly or yearly target for an expense category."
				title="No budgets yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={budgets}
				extraData={[monthlyAnalysis, yearlyAnalysis]}
				keyExtractor={(budget) => budget.id}
				renderItem={renderBudget}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("BudgetForm")}
			/>
		</View>
	);
};

const {
	ALIGN,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	OVERFLOW,
	RADIUS,
	SIZES,
	SPACING,
} = styleConstants;

const styles = StyleSheet.create({
	screen: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.background,
	},
	headingRow: {
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.SPACE_BETWEEN,
		alignItems: ALIGN.START,
		gap: SPACING.S10,
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
	period: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S11,
	},
	percentage: {
		color: COLORS.primaryBright,
		fontSize: FONT_SIZE.S18,
		fontWeight: FONT_WEIGHT.BLACK,
	},
	overBudget: {
		color: COLORS.danger,
	},
	progressTrack: {
		height: SIZES.S9,
		borderRadius: RADIUS.S5,
		backgroundColor: COLORS.surfaceBright,
		overflow: OVERFLOW.HIDDEN,
		marginTop: SPACING.S14,
	},
	progressFill: {
		height: SIZES.FULL,
		borderRadius: RADIUS.S5,
	},
	amounts: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		fontWeight: FONT_WEIGHT.BOLD,
		marginTop: SPACING.S8,
	},
	actions: {
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.END,
		gap: SPACING.S8,
		marginTop: SPACING.S12,
	},
});

export default BudgetsScreen;
