import {
	DonutChart,
	GlassCard,
	IconChevronLeft,
	IconChevronRight,
	Notice,
	SegmentedControl,
} from "@/components/ui";
import { useDb } from "@/hooks/useDatabase";
import {
	buildCategoryCurrencySummaries,
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
} from "@/services/analysisService";
import type { AnalysisPeriod } from "@/types/AnalysisPeriod";
import type { AnalysisSummary } from "@/types/AnalysisSummary";
import { getAnalysisDateRange, shiftAnalysisAnchor } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import {
	absoluteMoney,
	compareMoney,
	formatMoney,
	ZERO_AMOUNT,
} from "@/utils/money";
import { useCallback, useEffect, useMemo, useState } from "react";

const PERIOD_OPTS = [
	{ label: "Month", value: "MONTH" },
	{ label: "Year", value: "YEAR" },
	{ label: "All", value: "ALL" },
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
];

export const AnalysisPage = () => {
	const { db, dataVersion } = useDb();
	const [period, setPeriod] = useState<AnalysisPeriod>("MONTH");
	const [anchorDate, setAnchorDate] = useState(() => new Date());
	const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
	const [error, setError] = useState("");

	const dateRange = useMemo(
		() => getAnalysisDateRange(period, anchorDate),
		[period, anchorDate],
	);

	const load = useCallback(async () => {
		if (!db) return;
		try {
			setAnalysis(
				await getAnalysisSummary(db, {
					dateRange,
					isNativeCurrency: false,
				}),
			);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db, dateRange]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const periodLabel =
		period === "MONTH"
			? anchorDate.toLocaleString("en-IN", {
					month: "long",
					year: "numeric",
				})
			: period === "YEAR"
				? anchorDate.getFullYear().toString()
				: "All time";

	const expenseCategories =
		analysis?.categories.filter((c) => !c.isIncome) ?? [];
	const incomeCategories =
		analysis?.categories.filter((c) => c.isIncome) ?? [];
	const currencySummaries = analysis
		? buildCategoryCurrencySummaries(analysis.categories)
		: [];

	const chartData = expenseCategories.slice(0, 8).map((c, i) => ({
		label: c.categoryName,
		value: parseFloat(absoluteMoney(c.net)),
		color: CHART_COLORS[i % CHART_COLORS.length],
	}));

	return (
		<div style={{ maxWidth: 900 }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					marginBottom: 20,
				}}
			>
				<SegmentedControl
					options={PERIOD_OPTS}
					value={period}
					onChange={(v) => setPeriod(v as AnalysisPeriod)}
				/>
				{period !== "ALL" && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<button
							className="btn-icon btn"
							onClick={() =>
								setAnchorDate(
									shiftAnalysisAnchor(period, anchorDate, -1),
								)
							}
						>
							<IconChevronLeft size={14} />
						</button>
						<span
							style={{
								fontWeight: 700,
								color: "var(--text-muted)",
								fontSize: 13,
								minWidth: 120,
								textAlign: "center",
							}}
						>
							{periodLabel}
						</span>
						<button
							className="btn-icon btn"
							onClick={() =>
								setAnchorDate(
									shiftAnalysisAnchor(period, anchorDate, 1),
								)
							}
						>
							<IconChevronRight size={14} />
						</button>
					</div>
				)}
			</div>

			{error && <Notice message={error} tone="danger" />}

			{/* Summary strip */}
			{currencySummaries.map((s) => (
				<div
					key={s.currencyCode}
					className="summary-strip"
					style={{ marginBottom: 16 }}
				>
					<div className="summary-metric">
						<div className="summary-metric-label">Income</div>
						<div
							className="summary-metric-value"
							style={{ color: "var(--success)" }}
						>
							{formatMoney(s.totalIncome, s.currencyCode)}
						</div>
					</div>
					<div className="summary-metric">
						<div className="summary-metric-label">Expense</div>
						<div
							className="summary-metric-value"
							style={{ color: "var(--danger)" }}
						>
							{formatMoney(s.totalExpense, s.currencyCode)}
						</div>
					</div>
					<div className="summary-metric">
						<div className="summary-metric-label">Net</div>
						<div
							className="summary-metric-value"
							style={{
								color:
									compareMoney(s.netProfit, ZERO_AMOUNT) >= 0
										? "var(--success)"
										: "var(--danger)",
							}}
						>
							{formatMoney(s.netProfit, s.currencyCode)}
						</div>
					</div>
				</div>
			))}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "200px 1fr",
					gap: 20,
					alignItems: "start",
				}}
			>
				{chartData.length > 0 && (
					<div>
						<DonutChart data={chartData} size={200} />
					</div>
				)}

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 12,
					}}
				>
					{expenseCategories.length > 0 && (
						<GlassCard>
							<div
								style={{
									fontWeight: 900,
									fontSize: 13,
									color: "var(--text-dim)",
									marginBottom: 10,
									textTransform: "uppercase",
									letterSpacing: 0.8,
								}}
							>
								Expenses
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 6,
								}}
							>
								{expenseCategories.map((c, i) => (
									<div
										key={`${c.categoryId}-${c.currencyCode}`}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 8,
											}}
										>
											<div
												style={{
													width: 8,
													height: 8,
													borderRadius: 2,
													background:
														CHART_COLORS[
															i %
																CHART_COLORS.length
														],
													flexShrink: 0,
												}}
											/>
											<span
												style={{
													fontSize: 13,
													color: "var(--text-muted)",
												}}
											>
												{c.categoryName}
											</span>
										</div>
										<span
											style={{
												fontWeight: 800,
												fontSize: 13,
												color: "var(--danger)",
											}}
										>
											{formatMoney(
												absoluteMoney(c.net),
												c.currencyCode,
											)}
										</span>
									</div>
								))}
							</div>
						</GlassCard>
					)}
					{incomeCategories.length > 0 && (
						<GlassCard>
							<div
								style={{
									fontWeight: 900,
									fontSize: 13,
									color: "var(--text-dim)",
									marginBottom: 10,
									textTransform: "uppercase",
									letterSpacing: 0.8,
								}}
							>
								Income
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 6,
								}}
							>
								{incomeCategories.map((c) => (
									<div
										key={`${c.categoryId}-${c.currencyCode}`}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<span
											style={{
												fontSize: 13,
												color: "var(--text-muted)",
											}}
										>
											{c.categoryName}
										</span>
										<span
											style={{
												fontWeight: 800,
												fontSize: 13,
												color: "var(--success)",
											}}
										>
											{formatMoney(c.net, c.currencyCode)}
										</span>
									</div>
								))}
							</div>
						</GlassCard>
					)}
					{(analysis?.investments.length ?? 0) > 0 && (
						<GlassCard>
							<div
								style={{
									fontWeight: 900,
									fontSize: 13,
									color: "var(--text-dim)",
									marginBottom: 10,
									textTransform: "uppercase",
									letterSpacing: 0.8,
								}}
							>
								Investments
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 6,
								}}
							>
								{analysis!.investments.map((inv) => (
									<div
										key={`${inv.investmentId}-${inv.currencyCode}`}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<span
											style={{
												fontSize: 13,
												color: "var(--text-muted)",
											}}
										>
											{inv.investmentName}
										</span>
										<span
											style={{
												fontWeight: 800,
												fontSize: 13,
												color: "var(--primary-bright)",
											}}
										>
											{getInvestmentNetLabel(inv.net)}{" "}
											{formatMoney(
												getInvestmentNetAmount(inv.net),
												inv.currencyCode,
											)}
										</span>
									</div>
								))}
							</div>
						</GlassCard>
					)}
				</div>
			</div>
		</div>
	);
};
