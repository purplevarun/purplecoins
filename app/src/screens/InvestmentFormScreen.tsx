import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import PlatformPicker from "@/components/PlatformPicker";
import ScreenContainer from "@/components/ScreenContainer";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import investmentService from "@/services/investmentService";
import investmentTypeService from "@/services/investmentTypeService";
import platformService from "@/services/platformService";
import type InvestmentFormScreenProps from "@/types/InvestmentFormScreenProps";
import type InvestmentType from "@/types/InvestmentType";
import type Platform from "@/types/Platform";
import getErrorMessage from "@/utils/error";
const { getInvestment, saveInvestment } = investmentService;
const { getInvestmentTypes } = investmentTypeService;

const InvestmentFormScreen = ({
	navigation,
	route,
}: InvestmentFormScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const entityId = route.params?.entityId;
	const [name, setName] = useState("");
	const [platformId, setPlatformId] = useState(
		route.params?.platformId ?? "",
	);
	const [platforms, setPlatforms] = useState<readonly Platform[]>([]);
	const [investmentTypeId, setInvestmentTypeId] = useState(
		route.params?.investmentTypeId ?? "",
	);
	const [investmentTypes, setInvestmentTypes] = useState<
		readonly InvestmentType[]
	>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getRelations = async (): Promise<void> => {
			try {
				const [types, loadedPlatforms] = await Promise.all([
					getInvestmentTypes(database),
					platformService.getPlatforms(database),
				]);
				setInvestmentTypes(types);
				setPlatforms(loadedPlatforms);
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getRelations();
	}, [database]);

	useEffect(() => {
		const getEntity = async (): Promise<void> => {
			if (!entityId) {
				return;
			}
			try {
				const investment = await getInvestment(database, entityId);
				setName(investment?.name ?? "");
				setPlatformId(investment?.platformId ?? "");
				setInvestmentTypeId(investment?.investmentTypeId ?? "");
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getEntity();
	}, [database, entityId]);

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			await saveInvestment(
				database,
				entityId,
				name,
				investmentTypeId || null,
				platformId || null,
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
					<PlatformPicker
						platforms={platforms}
						value={platformId}
						onValueChange={(value) => setPlatformId(value ?? "")}
					/>
					<SelectField
						label="Investment type"
						isOptional
						placeholder="No type"
						options={investmentTypes.map((type) => ({
							label: type.name,
							value: type.id,
						}))}
						onChange={setInvestmentTypeId}
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
