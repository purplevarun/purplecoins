import {
	EmptyState,
	IconPlus,
	Notice,
	SegmentedControl,
} from "@/components/ui";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { getTransactions } from "@/services/transactionService";
import type { Transaction } from "@/types/Transaction";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { formatMoney } from "@/utils/money";
import { useCallback, useEffect, useMemo, useState } from "react";

const FILTERS = [
	{ label: "All", value: "ALL" },
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
];

const txnColor = (t: Transaction): string => {
	if (t.type === "CREDIT") return "var(--success)";
	if (t.type === "TRANSFER") return "var(--blue)";
	return "var(--danger)";
};

const txnIcon = (t: Transaction): string => {
	if (t.type === "CREDIT") return "↓";
	if (t.type === "TRANSFER") return "⇄";
	return "↑";
};

const txnIconBg = (t: Transaction): string => {
	if (t.type === "CREDIT") return "var(--success-muted)";
	if (t.type === "TRANSFER") return "rgba(96,165,250,0.16)";
	return "var(--danger-muted)";
};

const getDisplayReason = (t: Transaction): string => {
	if (t.type === "TRANSFER") {
		return `${t.sourceName} → ${t.destinationSourceName ?? "?"}`;
	}
	return t.reason || "(no reason)";
};

export const TransactionsPage = () => {
	const { db, dataVersion, refreshData } = useDb();
	const { navigate } = useRouter();
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [filter, setFilter] = useState("ALL");
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");

	const load = useCallback(async () => {
		if (!db) return;
		try {
			setTransactions(await getTransactions(db));
			setError("");
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	const filtered = useMemo(() => {
		let list = transactions;
		if (filter !== "ALL")
			list = list.filter((t) => t.classification === filter);
		if (search.trim()) {
			const q = search.toLowerCase().replace(/,/g, "");
			list = list.filter((t) => {
				const amount = t.amount.replace(/,/g, "");
				return (
					getDisplayReason(t).toLowerCase().includes(q) ||
					t.sourceName.toLowerCase().includes(q) ||
					amount.includes(q) ||
					(t.categoryName ?? "").toLowerCase().includes(q) ||
					(t.tripName ?? "").toLowerCase().includes(q) ||
					formatDate(t.transactionAt).toLowerCase().includes(q)
				);
			});
		}
		return list;
	}, [transactions, filter, search]);

	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					marginBottom: 16,
				}}
			>
				<SegmentedControl
					options={FILTERS}
					value={filter}
					onChange={setFilter}
				/>
				<input
					className="search-input"
					placeholder="Search transactions..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button
					className="btn btn-primary"
					style={{ marginLeft: "auto" }}
					onClick={() => navigate({ page: "transaction-form" })}
				>
					<IconPlus size={14} /> Add transaction
				</button>
			</div>

			{error && <Notice message={error} tone="danger" />}

			{filtered.length === 0 ? (
				<EmptyState
					icon="⇄"
					title="No transactions"
					description="Add a general or investment transaction to get started."
				/>
			) : (
				<div className="list">
					{filtered.map((t) => (
						<div
							key={t.id}
							className="txn-card"
							onClick={() =>
								navigate({
									page: "transaction-form",
									transactionId: t.id,
								})
							}
							title="Click to edit · Right-click to clone"
							onContextMenu={(e) => {
								e.preventDefault();
								navigate({
									page: "transaction-form",
									cloneFromId: t.id,
								});
							}}
						>
							<div
								className="txn-icon"
								style={{ background: txnIconBg(t) }}
							>
								<span
									style={{
										color: txnColor(t),
										fontWeight: 900,
									}}
								>
									{txnIcon(t)}
								</span>
							</div>
							<div className="txn-body">
								<div className="txn-reason">
									{getDisplayReason(t)}
								</div>
								<div className="txn-meta">
									{t.sourceName}
									{t.categoryName
										? ` · ${t.categoryName}`
										: ""}
									{t.tripName ? ` · ✈ ${t.tripName}` : ""}
									{t.investmentName
										? ` · ↗ ${t.investmentName}`
										: ""}
									{" · "}
									{formatDate(t.transactionAt)}
									{t.hasAttachment ? " · 📎" : ""}
								</div>
							</div>
							<div
								className="txn-amount"
								style={{ color: txnColor(t) }}
							>
								{t.type === "DEBIT"
									? "−"
									: t.type === "CREDIT"
										? "+"
										: ""}
								{formatMoney(t.amount, t.sourceCurrencyCode)}
							</div>
						</div>
					))}
				</div>
			)}

			<button
				className="fab"
				onClick={() => navigate({ page: "transaction-form" })}
			>
				+
			</button>
		</div>
	);
};
