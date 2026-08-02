import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SegmentedControl from "@/components/SegmentedControl";
import TextField from "@/components/TextField";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import categoryService from "@/services/categoryService";
import investmentService from "@/services/investmentService";
import sourceService from "@/services/sourceService";
import tripService from "@/services/tripService";
import type CategoryType from "@/types/CategoryType";
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import getErrorMessage from "@/utils/error";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getCategory, saveCategory } = categoryService;
const { getInvestment, saveInvestment } = investmentService;
const { createSource, getSource, updateSourceName } = sourceService;
const { getTrip, saveTrip } = tripService;

const CATEGORY_TYPE_OPTIONS: readonly SelectOption[] = [
	{ label: "Expense", value: "EXPENSE" },
	{ label: "Income", value: "INCOME" },
	{ label: "Refund", value: "REFUND" },
];

const CATEGORY_TYPE_DESCRIPTIONS: Readonly<Record<CategoryType, string>> = {
	EXPENSE:
		"Money going out that reduces your balance. Examples: Groceries, Taxi, Rent.",
	INCOME:
		"Money coming in that increases your balance. Examples: Salary, Cashback, Interest.",
	REFUND:
		"Money returned to you that isn't really income, like a loan repayment or deposit return. Excluded from Income, Expense, and Net totals. Examples: Lent (loan repayments), security deposit refunds.",
};

type RelationFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"RelationForm"
>;

const RelationFormScreen = ({
	navigation,
	route,
}: RelationFormScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { kind, entityId } = route.params;
	const [name, setName] = useState("");
	const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY_CODE);
	const [categoryType, setCategoryType] = useState<CategoryType>("EXPENSE");
	const [originalCategoryType, setOriginalCategoryType] =
		useState<CategoryType>("EXPENSE");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getEntity = async (): Promise<void> => {
			if (!entityId) {
				return;
			}
			try {
				if (kind === "SOURCE") {
					const source = await getSource(database, entityId);
					if (source) {
						setName(source.name);
						setCurrencyCode(source.currencyCode);
					}
					return;
				}
				if (kind === "CATEGORY") {
					const category = await getCategory(database, entityId);
					if (category) {
						setName(category.name);
						setCategoryType(category.type);
						setOriginalCategoryType(category.type);
					}
					return;
				}
				if (kind === "TRIP") {
					const trip = await getTrip(database, entityId);
					setName(trip?.name ?? "");
					return;
				}
				const investment = await getInvestment(database, entityId);
				setName(investment?.name ?? "");
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getEntity();
	}, [database, entityId, kind]);

	const processSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			if (kind === "SOURCE") {
				if (entityId) {
					await updateSourceName(database, entityId, name);
				} else {
					await createSource(database, name, currencyCode);
				}
			} else if (kind === "CATEGORY") {
				await saveCategory(database, entityId, name, categoryType);
			} else if (kind === "TRIP") {
				await saveTrip(database, entityId, name);
			} else {
				await saveInvestment(database, entityId, name);
			}
			// Bump dataVersion first so RelationsScreen reloads when we pop back
			refreshData();
			// Small delay to ensure the state update propagates before navigation
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsSaving(false);
		}
	};

	const handleSave = (): void => {
		const hasCategoryClassificationChanged =
			kind === "CATEGORY" &&
			Boolean(entityId) &&
			categoryType !== originalCategoryType;
		if (!hasCategoryClassificationChanged) {
			void processSave();
			return;
		}
		dialog.confirm({
			title: "Change analysis classification?",
			message:
				"This will reclassify the category across all historical analysis.",
			confirmLabel: "Change",
			variant: "danger",
			onConfirm: () => void processSave(),
		});
	};

	const entityLabel = kind.charAt(0) + kind.slice(1).toLowerCase();

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{entityId
							? `Edit ${entityLabel}`
							: `New ${entityLabel}`}
					</CustomText>
					<TextField
						label="Name"
						onChangeText={setName}
						placeholder={`${entityLabel} name`}
						value={name}
					/>
					{kind === "SOURCE" ? (
						<>
							<TextField
								autoCapitalize="characters"
								isEditable={!entityId}
								label="Currency"
								onChangeText={setCurrencyCode}
								placeholder="INR"
								value={currencyCode}
							/>
							{entityId ? (
								<Notice message="Currency is fixed after a source is created. Only the source name can be edited." />
							) : null}
						</>
					) : null}
					{kind === "CATEGORY" ? (
						<View style={styles.categoryTypeSection}>
							<SegmentedControl
								onChange={(value) =>
									setCategoryType(value as CategoryType)
								}
								options={CATEGORY_TYPE_OPTIONS}
								value={categoryType}
							/>
							<CustomText style={styles.categoryTypeDescription}>
								{CATEGORY_TYPE_DESCRIPTIONS[categoryType]}
							</CustomText>
						</View>
					) : null}
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isLoading={isSaving}
						label="Save"
						onPress={handleSave}
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
	categoryTypeSection: {
		gap: 10,
	},
	categoryTypeDescription: {
		color: COLORS.textMuted,
		fontSize: 12,
		lineHeight: 17,
		paddingHorizontal: 2,
	},
});

export default RelationFormScreen;
