import CustomText from "@/components/CustomText";

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import tripService from "@/services/tripService";
import tripTypeService from "@/services/tripTypeService";
import type TripFormScreenProps from "@/types/TripFormScreenProps";
import type TripType from "@/types/TripType";
import getErrorMessage from "@/utils/error";
const { getTrip, saveTrip } = tripService;

const TripFormScreen = ({
	navigation,
	route,
}: TripFormScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const entityId = route.params?.entityId;
	const [name, setName] = useState("");
	const [tripTypeId, setTripTypeId] = useState(
		route.params?.tripTypeId ?? "",
	);
	const [tripTypes, setTripTypes] = useState<readonly TripType[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		void tripTypeService
			.getTripTypes(database)
			.then(setTripTypes)
			.catch((caughtError: unknown) =>
				setError(getErrorMessage(caughtError)),
			);
		const getEntity = async (): Promise<void> => {
			if (!entityId) {
				return;
			}
			try {
				const trip = await getTrip(database, entityId);
				setName(trip?.name ?? "");
				setTripTypeId(trip?.tripTypeId ?? "");
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
			await saveTrip(database, entityId, name, tripTypeId || null);
			// Bump dataVersion first so TripsScreen reloads when we pop back
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
						{entityId ? "Edit trip" : "New trip"}
					</CustomText>
					<TextField
						label="Name"
						onChangeText={setName}
						placeholder="Trip name"
						value={name}
					/>
					<SelectField
						label="Type"
						options={tripTypes.map((type) => ({
							label: type.name,
							value: type.id,
						}))}
						value={tripTypeId}
						onChange={setTripTypeId}
						placeholder="Select trip type"
						isOptional
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

const { FONT_SIZE, FONT_WEIGHT, LETTER_SPACING, SPACING } = styleConstants;

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
});

export default TripFormScreen;
