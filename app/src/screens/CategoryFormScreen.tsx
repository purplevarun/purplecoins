import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import categoryService from "@/services/categoryService";
import type CategoryFormScreenProps from "@/types/CategoryFormScreenProps";
import getErrorMessage from "@/utils/error";
const { getCategory, saveCategory } = categoryService;

const CategoryFormScreen = ({
	navigation,
	route,
}: CategoryFormScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const entityId = route.params?.entityId;
	const [name, setName] = useState("");
	const [isIncome, setIsIncome] = useState(false);
	const [originalIsIncome, setOriginalIsIncome] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getEntity = async (): Promise<void> => {
			if (!entityId) {
				return;
			}
			try {
				const category = await getCategory(database, entityId);
				if (category) {
					setName(category.name);
					setIsIncome(category.isIncome);
					setOriginalIsIncome(category.isIncome);
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getEntity();
	}, [database, entityId]);

	const processSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			await saveCategory(database, entityId, name, isIncome);
			// Bump dataVersion first so CategoriesScreen reloads when we pop back
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
		const hasClassificationChanged =
			Boolean(entityId) && isIncome !== originalIsIncome;
		if (!hasClassificationChanged) {
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

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{entityId ? "Edit category" : "New category"}
					</CustomText>
					<TextField
						label="Name"
						onChangeText={setName}
						placeholder="Category name"
						value={name}
					/>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<CustomText style={styles.switchTitle}>
								Income category
							</CustomText>
							<CustomText style={styles.switchDescription}>
								Controls which analysis bucket receives this
								category. Net sign never changes the bucket.
							</CustomText>
						</View>
						<Switch
							onValueChange={setIsIncome}
							thumbColor={
								isIncome
									? COLORS.primaryBright
									: COLORS.textMuted
							}
							trackColor={{
								false: COLORS.border,
								true: COLORS.primaryMuted,
							}}
							value={isIncome}
						/>
					</View>
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

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	LINE_HEIGHT,
	RADIUS,
	SPACING,
} = styleConstants;

const styles = StyleSheet.create({
	form: {
		gap: SPACING.S16,
	},
	heading: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S24,
		fontWeight: FONT_WEIGHT.BLACK,
		letterSpacing: LETTER_SPACING.TIGHT,
	},
	switchRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S12,
		padding: SPACING.S14,
		borderRadius: RADIUS.S15,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surfaceSoft,
	},
	switchText: {
		flex: FLEX.FILL,
		gap: SPACING.S4,
	},
	switchTitle: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		fontWeight: FONT_WEIGHT.HEAVY,
	},
	switchDescription: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		lineHeight: LINE_HEIGHT.S17,
	},
});

export default CategoryFormScreen;
