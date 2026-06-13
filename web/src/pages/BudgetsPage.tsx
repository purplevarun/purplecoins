import {
	ConfirmModal,
	EmptyState,
	GlassCard,
	IconPlus,
	IconTrash,
	Notice,
} from "@/components/ui";
import { DEFAULT_CURRENCY_CODE } from "@/constants/appConstants";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { getAnalysisSummary } from "@/services/analysisService";
import { deleteBudget, getBudgets } from "@/services/budgetService";
import type { AnalysisSummary } from "@/types/AnalysisSummary";
import type { Budget } from "@/types/Budget";
import { getAnalysisDateRange } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { compareMoney, formatMoney, ZERO_AMOUNT } from "@/utils/money";
import { useCallback, useEffect, useState } from "react";

export const BudgetsPage = () => {
	const { db, dataVersion, refreshData } = useDb();
	const { navigate } = useRouter();
	const [budgets, setBudgets] = useState<readonly Budget[]>([]);
	const [monthlyAnalysis, setMonthlyAnalysis] =
		useState<AnalysisSummary | null>(null);
	const [yearlyAnalysis, setYearlyAnalysis] =
		useState<AnalysisSummary | null>(null);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

	const load = useCallback(async () => {
		if (!db) return;
		try {
			const now = new Date();
			const [b, m, y] = await Promise.all([
				getBudgets(db),
				getAnalysisSummary(db, {
					dateRange: getAnalysisDateRange("MONTH", now),
					isNativeCurrency: false,
				}),
				getAnalysisSummary(db, {
					dateRange: getAnalysisDateRange("YEAR", now),
					isNativeCurrency: false,
				}),
			]);
			setBudgets(b);
			setMonthlyAnalysis(m);
			setYearlyAnalysis(y);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const getSpent = (budget: Budget): string => {
		const summary =
			budget.period === "MONTHLY" ? monthlyAnalysis : yearlyAnalysis;
		const rows =
			summary?.categories.filter(
				(c) =>
					c.categoryId === budget.categoryId &&
					c.currencyCode === DEFAULT_CURRENCY_CODE,
			) ?? [];
		if (!rows.length) return ZERO_AMOUNT;
		const total = rows.reduce((sum, r) => {
			const net = parseFloat(r.net);
			// expense categories have negative net; take absolute
			return sum + Math.abs(net);
		}, 0);
		return String(total.toFixed(2));
	};

	const handleDelete = async (budget: Budget) => {
		if (!db) return;
		try {
			await deleteBudget(db, budget.id);
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					marginBottom: 16,
				}}
			>
				<button
					className="btn btn-primary"
					onClick={() => navigate({ page: "budget-form" })}
				>
					<IconPlus size={14} /> Add budget
				</button>
			</div>
			{error && <Notice message={error} tone="danger" />}
			{budgets.length === 0 ? (
				<EmptyState
					icon="◉"
					title="No budgets"
					description="Set spending targets for your categories."
				/>
			) : (
				<div className="list">
					{budgets.map((b) => {
						const spent = getSpent(b);
						const pct =
							Math.min(
								100,
								(parseFloat(spent) / parseFloat(b.amount)) *
									100,
							) || 0;
						const overBudget = compareMoney(spent, b.amount) > 0;
						const barColor = overBudget
							? "var(--danger)"
							: pct > 75
								? "var(--warning)"
								: "var(--success)";
						return (
							<GlassCard key={b.id}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										gap: 12,
									}}
								>
									<div
										style={{ flex: 1, cursor: "pointer" }}
										onClick={() =>
											navigate({
												page: "budget-form",
												budgetId: b.id,
											})
										}
									>
										<div
											style={{
												fontWeight: 800,
												color: "var(--text)",
											}}
										>
											{b.categoryName}
										</div>
										<div
											style={{
												fontSize: 11,
												color: "var(--text-dim)",
												marginTop: 2,
											}}
										>
											{b.period === "MONTHLY"
												? "Monthly"
												: "Yearly"}
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												marginTop: 8,
											}}
										>
											<span
												style={{
													fontSize: 13,
													fontWeight: 800,
													color: overBudget
														? "var(--danger)"
														: "var(--text-muted)",
												}}
											>
												{formatMoney(
													spent,
													DEFAULT_CURRENCY_CODE,
												)}
											</span>
											<span
												style={{
													fontSize: 12,
													color: "var(--text-dim)",
												}}
											>
												of{" "}
												{formatMoney(
													b.amount,
													DEFAULT_CURRENCY_CODE,
												)}
											</span>
										</div>
										<div className="budget-bar">
											<div
												className="budget-bar-fill"
												style={{
													width: `${pct}%`,
													background: barColor,
												}}
											/>
										</div>
									</div>
									<button
										className="btn-icon btn"
										onClick={() => setDeleteTarget(b)}
									>
										<IconTrash size={13} />
									</button>
								</div>
							</GlassCard>
						);
					})}
				</div>
			)}
			{deleteTarget && (
				<ConfirmModal
					title={`Delete budget for "${deleteTarget.categoryName}"?`}
					message="This budget will be permanently removed."
					confirmLabel="Delete"
					onConfirm={() => handleDelete(deleteTarget)}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
};
