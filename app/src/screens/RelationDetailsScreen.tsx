import CustomText from "@/components/CustomText";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import HeaderIconButton from "@/components/HeaderIconButton";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import investmentService from "@/services/investmentService";
import investmentTypeService from "@/services/investmentTypeService";
import platformService from "@/services/platformService";
import tripService from "@/services/tripService";
import tripTypeService from "@/services/tripTypeService";
import type Investment from "@/types/Investment";
import type RootStackParamList from "@/types/RootStackParamList";
import type Trip from "@/types/Trip";
import getErrorMessage from "@/utils/error";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const RelationDetailsScreen = ({
	navigation,
	route,
}: NativeStackScreenProps<
	RootStackParamList,
	"RelationDetails"
>): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { kind, entityId, entityName } = route.params;
	const [entities, setEntities] = useState<readonly (Trip | Investment)[]>(
		[],
	);
	const [error, setError] = useState("");
	const isTripType = kind === "TRIP_TYPE";
	const label = isTripType
		? "Trip type"
		: kind === "PLATFORM"
			? "Investment platform"
			: "Investment type";

	useFocusEffect(
		useCallback(() => {
			let active = true;
			const load = async (): Promise<void> => {
				try {
					setError("");
					const linked = isTripType
						? (await tripService.getTrips(database)).filter(
								(trip) => trip.tripTypeId === entityId,
							)
						: (
								await investmentService.getInvestments(database)
							).filter((investment) =>
								kind === "PLATFORM"
									? investment.platformId === entityId
									: investment.investmentTypeId === entityId,
							);
					if (active) setEntities(linked);
				} catch (caughtError: unknown) {
					if (active) setError(getErrorMessage(caughtError));
				}
			};
			void load();
			return () => {
				active = false;
			};
		}, [database, entityId, isTripType, kind]),
	);

	const handleDelete = useCallback(async (): Promise<void> => {
		try {
			if (isTripType)
				await tripTypeService.deleteTripType(database, entityId);
			else if (kind === "PLATFORM")
				await platformService.deletePlatform(database, entityId);
			else
				await investmentTypeService.deleteInvestmentType(
					database,
					entityId,
				);
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			dialog.showMessage({
				title: "Unable to delete",
				message: getErrorMessage(caughtError),
				variant: "danger",
			});
		}
	}, [database, dialog, entityId, isTripType, kind, navigation, refreshData]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderIconButton
					accessibilityLabel="Delete"
					icon="trash-outline"
					onPress={() =>
						dialog.confirm({
							title: `Delete "${entityName}"?`,
							message: `This ${label.toLowerCase()} will be permanently deleted. Linked records must be reassigned first.`,
							confirmLabel: "Delete",
							variant: "danger",
							onConfirm: () => void handleDelete(),
						})
					}
				/>
			),
		});
	}, [dialog, entityName, handleDelete, label, navigation]);

	return (
		<View style={styles.screen}>
			<ScreenList<Trip | Investment>
				data={entities}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={
					<ListHeader>
						<CustomText style={styles.meta}>{label}</CustomText>
						<CustomText style={styles.heading}>
							{entityName}
						</CustomText>
						{error ? (
							<Notice message={error} tone="danger" />
						) : null}
					</ListHeader>
				}
				ListEmptyComponent={
					error ? null : (
						<EmptyState
							icon={
								isTripType ? "airplane-outline" : "trending-up"
							}
							title={
								isTripType
									? "No trips yet"
									: "No investments yet"
							}
							message={
								isTripType
									? "No trips linked to this type."
									: "No investments linked here."
							}
						/>
					)
				}
				renderItem={({ item }) => (
					<Pressable
						accessibilityRole="button"
						onPress={() =>
							navigation.navigate("LinkedTransactions", {
								kind: isTripType ? "TRIP" : "INVESTMENT",
								entityId: item.id,
								entityName: item.name,
							})
						}
					>
						<GlassCard>
							<View style={styles.row}>
								<Ionicons
									name={
										isTripType
											? "airplane-outline"
											: "trending-up"
									}
									size={22}
									color={
										isTripType
											? COLORS.blue
											: COLORS.success
									}
								/>
								<CustomText style={styles.title}>
									{item.name}
								</CustomText>
								<Ionicons
									name="chevron-forward"
									size={18}
									color={COLORS.textMuted}
								/>
							</View>
						</GlassCard>
					</Pressable>
				)}
			/>
			<FloatingAddButton
				onPress={() =>
					isTripType
						? navigation.navigate("TripForm", {
								tripTypeId: entityId,
							})
						: navigation.navigate(
								"InvestmentForm",
								kind === "PLATFORM"
									? { platformId: entityId }
									: { investmentTypeId: entityId },
							)
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: COLORS.background },
	row: { flexDirection: "row", alignItems: "center", gap: 12 },
	title: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: "900" },
	heading: { color: COLORS.text, fontSize: 22, fontWeight: "900" },
	meta: { color: COLORS.textMuted, fontSize: 12 },
});

export default RelationDetailsScreen;
