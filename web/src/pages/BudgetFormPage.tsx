// BudgetFormPage
import {
	BackButton,
	Field,
	GlassCard,
	Notice,
	SegmentedControl,
	SelectInput,
	TextInput,
} from "@/components/ui";
import { useDb } from "@/hooks/useDatabase";
import { useRouter } from "@/hooks/useRouter";
import { getBudget, saveBudget } from "@/services/budgetService";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/types/Category";
import { getErrorMessage } from "@/utils/error";
import { useEffect, useState } from "react";

const PERIOD_OPTS = [
	{ label: "Monthly", value: "MONTHLY" },
	{ label: "Yearly", value: "YEARLY" },
];

export const BudgetFormPage = ({ budgetId }: { budgetId?: string }) => {
	const { db, refreshData } = useDb();
	const { back } = useRouter();
	const [categoryId, setCategoryId] = useState("");
	const [amount, setAmount] = useState("");
	const [period, setPeriod] = useState("MONTHLY");
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!db) return;
		const load = async () => {
			const [cats, existing] = await Promise.all([
				getCategories(db),
				budgetId ? getBudget(db, budgetId) : Promise.resolve(null),
			]);
			setCategories(cats);
			if (existing) {
				setCategoryId(existing.categoryId);
				setAmount(existing.amount);
				setPeriod(existing.period);
			}
		};
		void load();
	}, [db, budgetId]);

	const categoryOpts = categories
		.filter((c) => !c.isIncome)
		.map((c) => ({ label: c.name, value: c.id }));

	const handleSave = async () => {
		if (!db) return;
		setIsSaving(true);
		setError("");
		try {
			await saveBudget(
				db,
				budgetId,
				categoryId,
				amount,
				period as "MONTHLY" | "YEARLY",
			);
			refreshData();
			back();
		} catch (e) {
			setError(getErrorMessage(e));
		} finally {
			setIsSaving(false);
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
				{budgetId ? "Edit budget" : "New budget"}
			</div>
			<GlassCard>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 14,
					}}
				>
					<Field label="Category">
						<SelectInput
							value={categoryId}
							onChange={setCategoryId}
							options={categoryOpts}
							placeholder="Select category..."
						/>
					</Field>
					<Field label="Amount">
						<TextInput
							value={amount}
							onChange={setAmount}
							placeholder="0.00"
						/>
					</Field>
					<Field label="Period">
						<SegmentedControl
							options={PERIOD_OPTS}
							value={period}
							onChange={setPeriod}
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
					{isSaving ? "Saving..." : budgetId ? "Update" : "Save"}
				</button>
				<button className="btn btn-secondary" onClick={back}>
					Cancel
				</button>
			</div>
		</div>
	);
};
