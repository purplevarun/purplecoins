import CustomText from "@/components/CustomText";

import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import categoryService from "@/services/categoryService";
import type Category from "@/types/Category";
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import getErrorMessage from "@/utils/error";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const { getCategories, getCategoryMergeImpact, mergeCategories } = categoryService;

type MergeCategoriesScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"MergeCategories"
>;

const MergeCategoriesScreen = ({
	navigation,
}: MergeCategoriesScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [firstCategoryId, setFirstCategoryId] = useState("");
	const [secondCategoryId, setSecondCategoryId] = useState("");
	const [newCategoryName, setNewCategoryName] = useState("");
	const [impact, setImpact] = useState({ transactionCount: 0, budgetCount: 0 });
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadCategories = async (): Promise<void> => {
			try {
				setCategories(await getCategories(database));
				setError("");
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void loadCategories();
	}, [database]);

	useEffect(() => {
		const loadMergeImpact = async (): Promise<void> => {
			if (!firstCategoryId || !secondCategoryId || firstCategoryId === secondCategoryId) {
				setImpact({ transactionCount: 0, budgetCount: 0 });
				return;
			}
			try {
				setImpact(
					await getCategoryMergeImpact(
						database,
						firstCategoryId,
						secondCategoryId,
					),
				);
			} catch {
				setImpact({ transactionCount: 0, budgetCount: 0 });
			}
		};
		void loadMergeImpact();
	}, [database, firstCategoryId, secondCategoryId]);

	const firstCategory = categories.find(
		(category) => category.id === firstCategoryId,
	);
	const secondCategory = categories.find(
		(category) => category.id === secondCategoryId,
	);
	const hasTypeMismatch =
		firstCategory !== undefined &&
		secondCategory !== undefined &&
		firstCategory.isIncome !== secondCategory.isIncome;

	const firstCategoryOptions: readonly SelectOption[] = useMemo(
		() =>
			categories
				.filter((category) => category.id !== secondCategoryId)
				.map((category) => ({
					label: category.name,
					value: category.id,
					description: category.isIncome
						? "Income category"
						: "Expense category",
				})),
		[categories, secondCategoryId],
	);
	const secondCategoryOptions: readonly SelectOption[] = useMemo(
		() =>
			categories
				.filter((category) => category.id !== firstCategoryId)
				.map((category) => ({
					label: category.name,
					value: category.id,
					description: category.isIncome
						? "Income category"
						: "Expense category",
				})),
		[categories, firstCategoryId],
	);

	const canMerge =
		Boolean(firstCategoryId) &&
		Boolean(secondCategoryId) &&
		!hasTypeMismatch &&
		Boolean(newCategoryName.trim());

	const processMerge = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			await mergeCategories(
				database,
				firstCategoryId,
				secondCategoryId,
				newCategoryName,
			);
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsSaving(false);
		}
	};

	const handleMerge = (): void => {
		if (!canMerge) {
			setError("Select two categories and enter a new category name.");
			return;
		}
		const transactionSuffix = impact.transactionCount === 1 ? "" : "s";
		const budgetSuffix = impact.budgetCount === 1 ? "" : "s";
		dialog.confirm({
			title: "Merge categories?",
			message: `${impact.transactionCount} transaction${transactionSuffix} and ${impact.budgetCount} budget${budgetSuffix} will move to the new category, and the two old categories will be deleted.`,
			confirmLabel: "Merge",
			variant: "danger",
			onConfirm: () => void processMerge(),
		});
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>Merge categories</CustomText>
					<CustomText style={styles.description}>
						Create one new category from two existing categories. Monthly and
						yearly budgets are combined by period.
					</CustomText>
					<SelectField
						label="Category 1"
						onChange={setFirstCategoryId}
						options={firstCategoryOptions}
						placeholder="Select first category"
						value={firstCategoryId}
					/>
					<SelectField
						label="Category 2"
						onChange={setSecondCategoryId}
						options={secondCategoryOptions}
						placeholder="Select second category"
						value={secondCategoryId}
					/>
					<TextField
						label="New category name"
						onChangeText={setNewCategoryName}
						placeholder="Merged category name"
						value={newCategoryName}
					/>
					{categories.length < 2 ? (
						<Notice
							message="Create at least two categories before using merge."
							tone="warning"
						/>
					) : null}
					{hasTypeMismatch ? (
						<Notice
							message="Both selected categories must be either income or expense categories."
							tone="warning"
						/>
					) : null}
					{firstCategoryId && secondCategoryId && !hasTypeMismatch ? (
						<Notice
							message={`This merge will affect ${impact.transactionCount} transaction${impact.transactionCount === 1 ? "" : "s"} and ${impact.budgetCount} budget${impact.budgetCount === 1 ? "" : "s"}.`}
						/>
					) : null}
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isDisabled={categories.length < 2 || !canMerge}
						isLoading={isSaving}
						label="Merge categories"
						onPress={handleMerge}
						variant="danger"
					/>
				</View>
			</GlassCard>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	form: {
		gap: 16,
	},
	heading: {
		color: COLORS.text,
		fontSize: 24,
		fontWeight: "900",
		letterSpacing: -0.5,
	},
	description: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 19,
	},
});

export default MergeCategoriesScreen;


