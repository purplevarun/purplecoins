import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import budgetService from "@/services/budgetService";
import categoryService from "@/services/categoryService";
import type BudgetPeriod from "@/types/BudgetPeriod";
import type Category from "@/types/Category";
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import getErrorMessage from "@/utils/error";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getBudget, saveBudget } = budgetService;
const { getCategories } = categoryService;

type BudgetFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"BudgetForm"
>;

const PERIOD_OPTIONS: readonly SelectOption[] = [
	{ label: "Monthly", value: "MONTHLY" },
	{ label: "Yearly", value: "YEARLY" },
];

const BudgetFormScreen = ({
	navigation,
	route,
}: BudgetFormScreenProps): React.JSX.Element => {
	const budgetId = route.params?.budgetId;
	const { database, refreshData } = useDatabaseContext();
	const [categoryId, setCategoryId] = useState("");
	const [amount, setAmount] = useState("");
	const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getFormData = async (): Promise<void> => {
			try {
				const [loadedCategories, budget] = await Promise.all([
					getCategories(database),
					budgetId
						? getBudget(database, budgetId)
						: Promise.resolve(null),
				]);
				setCategories(
					loadedCategories.filter((category) => !category.isIncome),
				);
				if (budget) {
					setCategoryId(budget.categoryId);
					setAmount(budget.amount);
					setPeriod(budget.period);
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getFormData();
	}, [budgetId, database]);

	const categoryOptions: readonly SelectOption[] = categories.map(
		(category) => ({
			label: category.name,
			value: category.id,
		}),
	);

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			await saveBudget(database, budgetId, categoryId, amount, period);
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{budgetId ? "Edit budget" : "New budget"}
					</CustomText>
					<SelectField
						label="Expense category"
						onChange={setCategoryId}
						options={categoryOptions}
						placeholder="Select category"
						value={categoryId}
					/>
					<TextField
						keyboardType="decimal-pad"
						label={`Amount (${DEFAULT_CURRENCY_CODE})`}
						onChangeText={setAmount}
						placeholder="0.00"
						value={amount}
					/>
					<SegmentedControl
						onChange={(value) =>
							setPeriod(value === "YEARLY" ? "YEARLY" : "MONTHLY")
						}
						options={PERIOD_OPTIONS}
						value={period}
					/>
					<Notice message="The period follows calendar boundaries, not a rolling window." />
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isLoading={isSaving}
						label="Save budget"
						onPress={() => void handleSave()}
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
});

export default BudgetFormScreen;
