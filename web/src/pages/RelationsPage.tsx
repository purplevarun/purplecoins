import {
	ConfirmModal,
	EmptyState,
	GlassCard,
	IconGlobe,
	IconPlus,
	Notice,
} from "@/components/ui";
import type { RelationKind } from "@/hooks/router";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
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
import type { Source } from "@/types/Source";
import type { Trip } from "@/types/Trip";
import type { TripTotal } from "@/types/TripTotal";
import { getErrorMessage } from "@/utils/error";
import { compareMoney, formatMoney, ZERO_AMOUNT } from "@/utils/money";
import { getRelationLabels } from "@/utils/relation";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;

type Props = { kind: RelationKind };

export const RelationsPage = ({ kind }: Props) => {
	const { db, dataVersion, refreshData } = useDb();
	const { navigate } = useRouter();
	const labels = getRelationLabels(kind);

	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [tripTotals, setTripTotals] = useState<readonly TripTotal[]>([]);
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [rates, setRates] = useState<readonly ExchangeRate[]>([]);
	const [error, setError] = useState("");
	const [validateConfirm, setValidateConfirm] = useState<Source | null>(null);

	const load = useCallback(async () => {
		if (!db) return;
		try {
			setError("");
			const [native, loadedRates] = await Promise.all([
				getNativeCurrencyDisplay(db),
				getExchangeRates(db),
			]);
			setIsNativeCurrency(native);
			setRates(loadedRates);
			if (kind === "SOURCE") {
				setSources(await getSources(db));
				return;
			}
			if (kind === "CATEGORY") {
				const [cats, a] = await Promise.all([
					getCategories(db),
					getAnalysisSummary(db, {
						dateRange: { start: ALL_TIME_START, end: ALL_TIME_END },
						isNativeCurrency: native,
					}),
				]);
				setCategories(cats);
				setAnalysis(a);
				return;
			}
			if (kind === "TRIP") {
				const [trps, tt] = await Promise.all([
					getTrips(db),
					getTripTotals(db),
				]);
				setTrips(trps);
				setTripTotals(tt);
				return;
			}
			const [invs, a] = await Promise.all([
				getInvestments(db),
				getAnalysisSummary(db, {
					dateRange: { start: ALL_TIME_START, end: ALL_TIME_END },
					isNativeCurrency: native,
				}),
			]);
			setInvestments(invs);
			setAnalysis(a);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db, kind]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const rateMap = useMemo(() => {
		const m = new Map<string, Decimal>();
		rates.forEach((r) => m.set(r.currencyCode, new Decimal(r.rateToInr)));
		m.set("INR", new Decimal(1));
		return m;
	}, [rates]);

	const toInr = useCallback(
		(amount: string, code: string): Decimal => {
			const rate = rateMap.get(code);
			if (!rate)
				return code === "INR" ? new Decimal(amount) : new Decimal(0);
			return new Decimal(amount).times(rate);
		},
		[rateMap],
	);

	const handleToggle = async () => {
		if (!db) return;
		const next = !isNativeCurrency;
		await updateNativeCurrencyDisplay(db, next);
		setIsNativeCurrency(next);
		await load();
	};

	const handleValidate = async (source: Source) => {
		if (!db) return;
		try {
			await validateSource(db, source.id);
			refreshData();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	// Sort helpers
	const sortedSources = useMemo(
		() =>
			[...sources].sort((a, b) =>
				toInr(a.balance, a.currencyCode).comparedTo(
					toInr(b.balance, b.currencyCode),
				),
			),
		[sources, toInr],
	);

	const sortedCategories = useMemo(
		() =>
			[...categories].sort((a, b) => {
				const netA = (analysis?.categories ?? [])
					.filter((r) => r.categoryId === a.id)
					.reduce(
						(s, r) => s.plus(toInr(r.net, r.currencyCode)),
						new Decimal(0),
					);
				const netB = (analysis?.categories ?? [])
					.filter((r) => r.categoryId === b.id)
					.reduce(
						(s, r) => s.plus(toInr(r.net, r.currencyCode)),
						new Decimal(0),
					);
				return netA.comparedTo(netB);
			}),
		[categories, analysis, toInr],
	);

	const sortedTrips = useMemo(
		() =>
			[...trips].sort((a, b) => {
				const totA = tripTotals
					.filter((r) => r.tripId === a.id)
					.reduce(
						(s, r) => s.plus(toInr(r.total, r.currencyCode)),
						new Decimal(0),
					);
				const totB = tripTotals
					.filter((r) => r.tripId === b.id)
					.reduce(
						(s, r) => s.plus(toInr(r.total, r.currencyCode)),
						new Decimal(0),
					);
				return totB.comparedTo(totA);
			}),
		[trips, tripTotals, toInr],
	);

	const sortedInvestments = useMemo(
		() =>
			[...investments].sort((a, b) => {
				const netA = (analysis?.investments ?? [])
					.filter((r) => r.investmentId === a.id)
					.reduce(
						(s, r) => s.plus(toInr(r.net, r.currencyCode)),
						new Decimal(0),
					);
				const netB = (analysis?.investments ?? [])
					.filter((r) => r.investmentId === b.id)
					.reduce(
						(s, r) => s.plus(toInr(r.net, r.currencyCode)),
						new Decimal(0),
					);
				return netB.comparedTo(netA);
			}),
		[investments, analysis, toInr],
	);

	const renderSource = (s: Source) => {
		const inrVal =
			!isNativeCurrency && s.currencyCode !== "INR"
				? toInr(s.balance, s.currencyCode)
				: null;
		const balColor =
			compareMoney(s.balance, ZERO_AMOUNT) >= 0
				? "var(--success)"
				: "var(--danger)";
		return (
			<GlassCard key={s.id} style={{ cursor: "pointer" }}>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						gap: 12,
					}}
				>
					<div
						onClick={() =>
							navigate({
								page: "linked-transactions",
								kind,
								entityId: s.id,
								entityName: s.name,
							})
						}
						style={{ flex: 1 }}
					>
						<div style={{ fontWeight: 800, color: "var(--text)" }}>
							{s.name}
						</div>
						<div
							style={{
								fontSize: 11,
								color: "var(--text-dim)",
								marginTop: 2,
							}}
						>
							{s.currencyCode}
						</div>
						<div
							style={{
								fontWeight: 900,
								fontSize: 15,
								marginTop: 4,
								color: balColor,
							}}
						>
							{formatMoney(s.balance, s.currencyCode)}
						</div>
						{inrVal && !inrVal.isZero() && (
							<div
								style={{
									fontSize: 12,
									fontWeight: 800,
									marginTop: 2,
									color: inrVal.gte(0)
										? "var(--success)"
										: "var(--danger)",
								}}
							>
								≈ {formatMoney(inrVal.abs().toFixed(), "INR")}
							</div>
						)}
					</div>
					<div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
						<button
							className="btn btn-secondary"
							style={{ fontSize: 11, padding: "5px 10px" }}
							onClick={() => setValidateConfirm(s)}
						>
							✓ Validate
						</button>
						<button
							className="btn btn-secondary"
							style={{ fontSize: 11, padding: "5px 10px" }}
							onClick={() =>
								navigate({
									page: "relation-form",
									kind,
									entityId: s.id,
								})
							}
						>
							Edit
						</button>
					</div>
				</div>
			</GlassCard>
		);
	};

	const renderCategory = (c: Category) => {
		const totals =
			analysis?.categories.filter((r) => r.categoryId === c.id) ?? [];
		return (
			<GlassCard key={c.id} style={{ cursor: "pointer" }}>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
					}}
				>
					<div
						onClick={() =>
							navigate({
								page: "linked-transactions",
								kind,
								entityId: c.id,
								entityName: c.name,
							})
						}
						style={{ flex: 1 }}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							<span
								style={{
									fontWeight: 800,
									color: "var(--text)",
								}}
							>
								{c.name}
							</span>
							<span
								className={
									c.isIncome
										? "badge badge-income"
										: "badge badge-expense"
								}
							>
								{c.isIncome ? "Income" : "Expense"}
							</span>
						</div>
						<div
							style={{
								marginTop: 6,
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							{totals.length === 0 ? (
								<span
									style={{
										fontSize: 13,
										color: "var(--text-dim)",
									}}
								>
									{formatMoney(ZERO_AMOUNT, "INR")}
								</span>
							) : (
								totals.map((total, i) => {
									const netColor =
										compareMoney(total.net, ZERO_AMOUNT) >=
										0
											? "var(--success)"
											: "var(--danger)";
									return (
										<span
											key={i}
											style={{
												fontSize: 13,
												fontWeight: 800,
												color: netColor,
											}}
										>
											{!isNativeCurrency ? "≈ " : ""}
											{formatMoney(
												total.net,
												total.currencyCode,
											)}
										</span>
									);
								})
							)}
						</div>
					</div>
					<button
						className="btn btn-secondary"
						style={{
							fontSize: 11,
							padding: "5px 10px",
							flexShrink: 0,
						}}
						onClick={() =>
							navigate({
								page: "relation-form",
								kind,
								entityId: c.id,
							})
						}
					>
						Edit
					</button>
				</div>
			</GlassCard>
		);
	};

	const renderTrip = (t: Trip) => {
		const totals = tripTotals.filter((r) => r.tripId === t.id);
		const inrTotal =
			!isNativeCurrency && totals.some((r) => r.currencyCode !== "INR")
				? totals.reduce(
						(s, r) => s.plus(toInr(r.total, r.currencyCode)),
						new Decimal(0),
					)
				: null;
		return (
			<GlassCard key={t.id} style={{ cursor: "pointer" }}>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
					}}
				>
					<div
						onClick={() =>
							navigate({
								page: "linked-transactions",
								kind,
								entityId: t.id,
								entityName: t.name,
							})
						}
						style={{ flex: 1 }}
					>
						<div style={{ fontWeight: 800, color: "var(--text)" }}>
							{t.name}
						</div>
						<div
							style={{
								marginTop: 6,
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							{totals.length === 0 ? (
								<span
									style={{
										fontSize: 13,
										color: "var(--text-dim)",
									}}
								>
									{formatMoney(ZERO_AMOUNT, "INR")}
								</span>
							) : (
								totals.map((total, i) => (
									<span
										key={i}
										style={{
											fontSize: 13,
											fontWeight: 800,
											color: "var(--warning)",
										}}
									>
										Total{" "}
										{formatMoney(
											total.total,
											total.currencyCode,
										)}
									</span>
								))
							)}
							{inrTotal && !inrTotal.isZero() && (
								<span
									style={{
										fontSize: 12,
										fontWeight: 800,
										color: inrTotal.gte(0)
											? "var(--danger)"
											: "var(--success)",
									}}
								>
									≈{" "}
									{formatMoney(
										inrTotal.abs().toFixed(),
										"INR",
									)}
								</span>
							)}
						</div>
					</div>
					<button
						className="btn btn-secondary"
						style={{
							fontSize: 11,
							padding: "5px 10px",
							flexShrink: 0,
						}}
						onClick={() =>
							navigate({
								page: "relation-form",
								kind,
								entityId: t.id,
							})
						}
					>
						Edit
					</button>
				</div>
			</GlassCard>
		);
	};

	const renderInvestment = (inv: Investment) => {
		const totals =
			analysis?.investments.filter((r) => r.investmentId === inv.id) ??
			[];
		return (
			<GlassCard key={inv.id} style={{ cursor: "pointer" }}>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
					}}
				>
					<div
						onClick={() =>
							navigate({
								page: "linked-transactions",
								kind,
								entityId: inv.id,
								entityName: inv.name,
							})
						}
						style={{ flex: 1 }}
					>
						<div style={{ fontWeight: 800, color: "var(--text)" }}>
							{inv.name}
						</div>
						<div
							style={{
								marginTop: 6,
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							{totals.length === 0 ? (
								<span
									style={{
										fontSize: 13,
										color: "var(--text-dim)",
									}}
								>
									{formatMoney(ZERO_AMOUNT, "INR")}
								</span>
							) : (
								totals.map((total, i) => {
									const netColor =
										compareMoney(total.net, ZERO_AMOUNT) >=
										0
											? "var(--danger)"
											: "var(--success)";
									return (
										<span
											key={i}
											style={{
												fontSize: 13,
												fontWeight: 800,
												color: netColor,
											}}
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
										</span>
									);
								})
							)}
						</div>
					</div>
					<button
						className="btn btn-secondary"
						style={{
							fontSize: 11,
							padding: "5px 10px",
							flexShrink: 0,
						}}
						onClick={() =>
							navigate({
								page: "relation-form",
								kind,
								entityId: inv.id,
							})
						}
					>
						Edit
					</button>
				</div>
			</GlassCard>
		);
	};

	const items =
		kind === "SOURCE"
			? sortedSources
			: kind === "CATEGORY"
				? sortedCategories
				: kind === "TRIP"
					? sortedTrips
					: sortedInvestments;

	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					marginBottom: 16,
				}}
			>
				<button
					className={`btn-icon btn ${!isNativeCurrency ? "active" : ""}`}
					onClick={handleToggle}
					title={
						isNativeCurrency
							? "Convert to INR"
							: "Show native currencies"
					}
				>
					<IconGlobe size={15} />
				</button>
				<button
					className="btn btn-primary"
					style={{ marginLeft: "auto" }}
					onClick={() => navigate({ page: "relation-form", kind })}
				>
					<IconPlus size={14} /> Add {labels.singular}
				</button>
			</div>

			{error && <Notice message={error} tone="danger" />}

			{items.length === 0 ? (
				<EmptyState
					icon="◎"
					title={`No ${labels.plural}`}
					description={`Add a ${labels.singular} to get started.`}
				/>
			) : (
				<div className="list">
					{kind === "SOURCE" && sortedSources.map(renderSource)}
					{kind === "CATEGORY" &&
						sortedCategories.map(renderCategory)}
					{kind === "TRIP" && sortedTrips.map(renderTrip)}
					{kind === "INVESTMENT" &&
						sortedInvestments.map(renderInvestment)}
				</div>
			)}

			{validateConfirm && (
				<ConfirmModal
					title={`Validate "${validateConfirm.name}"?`}
					message="Mark this source balance as confirmed."
					confirmLabel="Validate"
					variant="primary"
					onConfirm={() => handleValidate(validateConfirm)}
					onCancel={() => setValidateConfirm(null)}
				/>
			)}
		</div>
	);
};
