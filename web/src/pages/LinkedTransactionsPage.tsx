import { BackButton, EmptyState, Notice } from "@/components/ui";
import type { RelationKind } from "@/hooks/router";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { getLinkedTransactions } from "@/services/transactionService";
import type { Transaction } from "@/types/Transaction";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { formatMoney } from "@/utils/money";
import { useCallback, useEffect, useState } from "react";

type Props = { kind: RelationKind; entityId: string; entityName: string };

const txnColor = (t: Transaction) =>
	t.type === "CREDIT"
		? "var(--success)"
		: t.type === "TRANSFER"
			? "var(--blue)"
			: "var(--danger)";
const txnIcon = (t: Transaction) =>
	t.type === "CREDIT" ? "+" : t.type === "TRANSFER" ? "⇄" : "−";

const getDisplayReason = (t: Transaction): string =>
	t.type === "TRANSFER"
		? `${t.sourceName} → ${t.destinationSourceName ?? "?"}`
		: t.reason || "(no reason)";

export const LinkedTransactionsPage = ({
	kind,
	entityId,
	entityName,
}: Props) => {
	const { db, dataVersion } = useDb();
	const { back, navigate } = useRouter();
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [error, setError] = useState("");

	const load = useCallback(async () => {
		if (!db) return;
		try {
			setTransactions(
				await getLinkedTransactions(db, { kind, entityId }),
			);
		} catch (e) {
			setError(getErrorMessage(e));
		}
	}, [db, kind, entityId]);

	useEffect(() => {
		void load();
	}, [dataVersion, load]);

	return (
		<div>
			<BackButton onClick={back} />
			<div
				style={{
					fontSize: 20,
					fontWeight: 900,
					color: "var(--text)",
					margin: "8px 0 16px",
				}}
			>
				{entityName}
			</div>
			{error && <Notice message={error} tone="danger" />}
			{transactions.length === 0 ? (
				<EmptyState
					icon="⇄"
					title="No transactions"
					description="No transactions linked to this item yet."
				/>
			) : (
				<div className="list">
					{transactions.map((t) => (
						<div
							key={t.id}
							className="txn-card"
							onClick={() =>
								navigate({
									page: "transaction-form",
									transactionId: t.id,
								})
							}
						>
							<div
								className="txn-icon"
								style={{
									background:
										t.type === "CREDIT"
											? "var(--success-muted)"
											: t.type === "TRANSFER"
												? "rgba(96,165,250,0.16)"
												: "var(--danger-muted)",
								}}
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
									{t.sourceName} ·{" "}
									{formatDate(t.transactionAt)}
								</div>
							</div>
							<div
								className="txn-amount"
								style={{ color: txnColor(t) }}
							>
								{formatMoney(t.amount, t.sourceCurrencyCode)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
