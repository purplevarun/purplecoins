import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import InvestmentTypePicker from "@/components/InvestmentTypePicker";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import investmentService from "@/services/investmentService";
import investmentTypeService from "@/services/investmentTypeService";
import type InvestmentFormScreenProps from "@/types/InvestmentFormScreenProps";
import type InvestmentType from "@/types/InvestmentType";
import getErrorMessage from "@/utils/error";
const { getInvestment, saveInvestment } = investmentService;
const { getInvestmentTypes, saveInvestmentType } = investmentTypeService;

const InvestmentFormScreen = ({
	navigation,
	route,
}: InvestmentFormScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const entityId = route.params?.entityId;
	const [name, setName] = useState("");
	const [label, setLabel] = useState("");
	const [investmentTypeId, setInvestmentTypeId] = useState("");
	const [investmentTypes, setInvestmentTypes] = useState<
		readonly InvestmentType[]
	>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getTypes = async (): Promise<void> => {
			setInvestmentTypes(await getInvestmentTypes(database));
		};
		void getTypes();
	}, [database]);

	useEffect(() => {
		const getEntity = async (): Promise<void> => {
			if (!entityId) {
				return;
			}
			try {
				const investment = await getInvestment(database, entityId);
				setName(investment?.name ?? "");
				setLabel(investment?.label ?? "");
				setInvestmentTypeId(investment?.investmentTypeId ?? "");
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getEntity();
	}, [database, entityId]);

	const handleCreateInvestmentType = async (
		typeName: string,
	): Promise<string> => {
		const id = await saveInvestmentType(database, typeName);
		setInvestmentTypes(await getInvestmentTypes(database));
		return id;
	};

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			await saveInvestment(
				database,
				entityId,
				name,
				label,
				investmentTypeId || null,
			);
			// Bump dataVersion first so InvestmentsScreen reloads when we pop back
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

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{entityId ? "Edit investment" : "New investment"}
					</CustomText>
					<TextField
						label="Name"
						onChangeText={setName}
						placeholder="Investment name"
						value={name}
					/>
					<TextField
						label="Label"
						onChangeText={setLabel}
						placeholder="Optional label"
						value={label}
					/>
					<InvestmentTypePicker
						investmentTypes={investmentTypes}
						onChange={setInvestmentTypeId}
						onCreateInvestmentType={handleCreateInvestmentType}
						value={investmentTypeId}
					/>
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isLoading={isSaving}
						label="Save"
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

export default InvestmentFormScreen;
