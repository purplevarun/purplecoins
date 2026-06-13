import {
	BackButton,
	ConfirmModal,
	DateInput,
	Field,
	GlassCard,
	IconTrash,
	Notice,
	SegmentedControl,
	SelectInput,
	TextInput,
} from "@/components/ui";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { getCategories } from "@/services/categoryService";
import { getInvestments } from "@/services/investmentService";
import { getSources } from "@/services/sourceService";
import {
	deleteTransaction,
	getTransaction,
	saveTransaction,
} from "@/services/transactionService";
import { getTrips } from "@/services/tripService";
import type { Category } from "@/types/Category";
import type { Investment } from "@/types/Investment";
import type { Source } from "@/types/Source";
import type { TransactionClassification } from "@/types/TransactionClassification";
import type { TransactionType } from "@/types/TransactionType";
import type { Trip } from "@/types/Trip";
import { getErrorMessage } from "@/utils/error";
import { useEffect, useState } from "react";

const CLASS_OPTS = [
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
];
const GENERAL_TYPE_OPTS = [
	{ label: "Debit", value: "DEBIT" },
	{ label: "Credit", value: "CREDIT" },
	{ label: "Transfer", value: "TRANSFER" },
];
const INV_TYPE_OPTS = [
	{ label: "Debit", value: "DEBIT" },
	{ label: "Credit", value: "CREDIT" },
];

type Props = { transactionId?: string; cloneFromId?: string };

export const TransactionFormPage = ({ transactionId, cloneFromId }: Props) => {
	const { db, refreshData } = useDb();
	const { back } = useRouter();
	const isEdit = Boolean(transactionId);
	const isClone = Boolean(cloneFromId);

	const [classification, setClassification] =
		useState<TransactionClassification>("GENERAL");
	const [type, setType] = useState<TransactionType>("DEBIT");
	const [sourceId, setSourceId] = useState("");
	const [destSourceId, setDestSourceId] = useState("");
	const [amount, setAmount] = useState("");
	const [toAmount, setToAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [tripId, setTripId] = useState("");
	const [investmentId, setInvestmentId] = useState("");
	const [reason, setReason] = useState("");
	const [transactionAt, setTransactionAt] = useState(() => Date.now());
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [showDelete, setShowDelete] = useState(false);

	useEffect(() => {
		if (!db) return;
		const load = async () => {
			const srcId = transactionId ?? cloneFromId;
			const [s, c, tr, inv, existing] = await Promise.all([
				getSources(db),
				getCategories(db),
				getTrips(db),
				getInvestments(db),
				srcId ? getTransaction(db, srcId) : Promise.resolve(null),
			]);
			setSources(s);
			setCategories(c);
			setTrips(tr);
			setInvestments(inv);
			if (!existing) return;
			setClassification(existing.classification);
			setType(existing.type);
			setSourceId(existing.sourceId);
			setDestSourceId(existing.destinationSourceId ?? "");
			setAmount(existing.amount);
			setToAmount(existing.toAmount ?? "");
			setCategoryId(existing.categoryId ?? "");
			setTripId(existing.tripId ?? "");
			setInvestmentId(existing.investmentId ?? "");
			setReason(existing.reason);
			if (!isClone) setTransactionAt(existing.transactionAt);
		};
		void load();
	}, [db, transactionId, cloneFromId, isClone]);

	const sourceOpts = sources.map((s) => ({
		label: `${s.name}`,
		value: s.id,
		description: `${s.currencyCode} · ${s.balance}`,
	}));
	const categoryOpts = categories.map((c) => ({
		label: c.name,
		value: c.id,
		description: c.isIncome ? "Income ↑" : "Expense ↓",
	}));
	const tripOpts = [
		{ label: "None", value: "", description: "No trip" },
		...trips.map((t) => ({ label: t.name, value: t.id })),
	];
	const investmentOpts = investments.map((i) => ({
		label: i.name,
		value: i.id,
	}));
	const typeOpts =
		classification === "INVESTMENT" ? INV_TYPE_OPTS : GENERAL_TYPE_OPTS;

	const isTransfer = classification === "GENERAL" && type === "TRANSFER";
	const isInvestment = classification === "INVESTMENT";

	const handleSave = async () => {
		if (!db) return;
		setIsSaving(true);
		setError("");
		try {
			await saveTransaction(db, {
				id: transactionId,
				classification,
				type,
				sourceId,
				destinationSourceId: isTransfer ? destSourceId : undefined,
				amount,
				toAmount: isTransfer ? toAmount : undefined,
				categoryId:
					!isTransfer && !isInvestment ? categoryId : undefined,
				tripId:
					!isTransfer && !isInvestment
						? tripId || undefined
						: undefined,
				investmentId: isInvestment ? investmentId : undefined,
				reason,
				transactionAt,
			});
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!db || !transactionId) return;
		try {
			await deleteTransaction(db, transactionId);
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

	const title = isEdit
		? "Edit transaction"
		: isClone
			? "Clone transaction"
			: "New transaction";

	return (
		<div className="page-form">
			<BackButton onClick={back} />
			<div
				style={{
					fontSize: 20,
					fontWeight: 900,
					color: "var(--text)",
					marginBottom: 4,
				}}
			>
				{title}
			</div>

			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<Field label="Classification">
						<SegmentedControl
							options={CLASS_OPTS}
							value={classification}
							onChange={(v) =>
								setClassification(
									v as TransactionClassification,
								)
							}
						/>
					</Field>
					<Field label="Type">
						<SegmentedControl
							options={typeOpts}
							value={type}
							onChange={(v) => {
								setType(v as TransactionType);
								if (v !== "TRANSFER") setDestSourceId("");
							}}
						/>
					</Field>
					<Field label="Source">
						<SelectInput
							value={sourceId}
							onChange={setSourceId}
							options={sourceOpts}
							placeholder="Select source..."
						/>
					</Field>
					{isTransfer && (
						<Field label="Destination source">
							<SelectInput
								value={destSourceId}
								onChange={setDestSourceId}
								options={sourceOpts}
								placeholder="Select destination..."
							/>
						</Field>
					)}
					<Field label="Amount">
						<TextInput
							value={amount}
							onChange={setAmount}
							placeholder="0.00"
						/>
					</Field>
					{isTransfer && (
						<Field label="To amount">
							<TextInput
								value={toAmount}
								onChange={setToAmount}
								placeholder="0.00"
							/>
						</Field>
					)}
					{!isTransfer && !isInvestment && (
						<Field label="Category">
							<SelectInput
								value={categoryId}
								onChange={setCategoryId}
								options={categoryOpts}
								placeholder="Select category..."
							/>
						</Field>
					)}
					{!isTransfer && !isInvestment && (
						<Field label="Trip (optional)">
							<SelectInput
								value={tripId}
								onChange={setTripId}
								options={tripOpts}
							/>
						</Field>
					)}
					{isInvestment && (
						<Field label="Investment">
							<SelectInput
								value={investmentId}
								onChange={setInvestmentId}
								options={investmentOpts}
								placeholder="Select investment..."
							/>
						</Field>
					)}
					{!isTransfer && (
						<Field label="Reason">
							<TextInput
								value={reason}
								onChange={setReason}
								placeholder="What was this for?"
							/>
						</Field>
					)}
					<Field label="Date">
						<DateInput
							value={transactionAt}
							onChange={setTransactionAt}
						/>
					</Field>
				</div>
			</GlassCard>

			{error && <Notice message={error} tone="danger" />}

			<div className="form-actions">
				<button
					className="btn btn-primary"
					onClick={handleSave}
					disabled={isSaving}
				>
					{isSaving ? "Saving..." : isEdit ? "Update" : "Save"}
				</button>
				<button className="btn btn-secondary" onClick={back}>
					Cancel
				</button>
				{isEdit && (
					<button
						className="btn btn-danger"
						style={{ marginLeft: "auto" }}
						onClick={() => setShowDelete(true)}
					>
						<IconTrash size={13} /> Delete
					</button>
				)}
			</div>

			{showDelete && (
				<ConfirmModal
					title="Delete transaction?"
					message="This action cannot be undone."
					confirmLabel="Delete"
					onConfirm={handleDelete}
					onCancel={() => setShowDelete(false)}
				/>
			)}
		</div>
	);
};
