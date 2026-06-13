import {
	BackButton,
	ConfirmModal,
	Field,
	GlassCard,
	IconTrash,
	Notice,
	Switch,
	TextInput,
} from "@/components/ui";
import type { RelationKind } from "@/hooks/router";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import {
	deleteCategory,
	getCategory,
	saveCategory,
} from "@/services/categoryService";
import {
	deleteInvestment,
	getInvestment,
	saveInvestment,
} from "@/services/investmentService";
import {
	createSource,
	deleteSource,
	getSource,
	updateSourceName,
} from "@/services/sourceService";
import { deleteTrip, getTrip, saveTrip } from "@/services/tripService";
import { getErrorMessage } from "@/utils/error";
import { getRelationLabels } from "@/utils/relation";
import { useEffect, useState } from "react";

type Props = { kind: RelationKind; entityId?: string };

export const RelationFormPage = ({ kind, entityId }: Props) => {
	const { db, refreshData } = useDb();
	const { back } = useRouter();
	const labels = getRelationLabels(kind);
	const isEdit = Boolean(entityId);

	const [name, setName] = useState("");
	const [currencyCode, setCurrencyCode] = useState("INR");
	const [isIncome, setIsIncome] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [showDelete, setShowDelete] = useState(false);

	useEffect(() => {
		if (!db || !entityId) return;
		const load = async () => {
			try {
				if (kind === "SOURCE") {
					const s = await getSource(db, entityId);
					if (s) {
						setName(s.name);
						setCurrencyCode(s.currencyCode);
					}
				} else if (kind === "CATEGORY") {
					const c = await getCategory(db, entityId);
					if (c) {
						setName(c.name);
						setIsIncome(Boolean(c.isIncome));
					}
				} else if (kind === "TRIP") {
					const t = await getTrip(db, entityId);
					if (t) setName(t.name);
				} else {
					const i = await getInvestment(db, entityId);
					if (i) setName(i.name);
				}
			} catch (e) {
				setError(getErrorMessage(e));
			}
		};
		void load();
	}, [db, entityId, kind]);

	const handleSave = async () => {
		if (!db) return;
		setIsSaving(true);
		setError("");
		try {
			if (kind === "SOURCE") {
				if (isEdit && entityId)
					await updateSourceName(db, entityId, name);
				else await createSource(db, name, currencyCode);
			} else if (kind === "CATEGORY") {
				await saveCategory(db, entityId, name, isIncome);
			} else if (kind === "TRIP") {
				await saveTrip(db, entityId, name);
			} else {
				await saveInvestment(db, entityId, name);
			}
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!db || !entityId) return;
		try {
			if (kind === "SOURCE") await deleteSource(db, entityId);
			else if (kind === "CATEGORY") await deleteCategory(db, entityId);
			else if (kind === "TRIP") await deleteTrip(db, entityId);
			else await deleteInvestment(db, entityId);
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		}
	};

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
				{isEdit ? `Edit ${labels.singular}` : `New ${labels.singular}`}
			</div>
			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<Field label="Name">
						<TextInput
							value={name}
							onChange={setName}
							placeholder={`${labels.singular} name`}
							autoFocus
						/>
					</Field>
					{kind === "SOURCE" && !isEdit && (
						<Field label="Currency code">
							<TextInput
								value={currencyCode}
								onChange={(v) =>
									setCurrencyCode(v.toUpperCase())
								}
								placeholder="INR"
							/>
						</Field>
					)}
					{kind === "CATEGORY" && (
						<Field label="Type">
							<div className="switch-row">
								<span
									style={{
										fontSize: 13,
										color: "var(--text-muted)",
									}}
								>
									{isIncome ? "Income" : "Expense"}
								</span>
								<Switch
									checked={isIncome}
									onChange={setIsIncome}
								/>
							</div>
						</Field>
					)}
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
					title={`Delete "${name}"?`}
					message={`This ${labels.singular} will be permanently removed. Items linked to it cannot be deleted.`}
					confirmLabel="Delete"
					onConfirm={handleDelete}
					onCancel={() => setShowDelete(false)}
				/>
			)}
		</div>
	);
};
