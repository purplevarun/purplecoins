import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
	type ComponentProps,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { SearchBar } from "@/components/SearchBar";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	getArchivedCategories,
	setCategoryArchived,
} from "@/services/categoryService";
import {
	getArchivedInvestments,
	setInvestmentArchived,
} from "@/services/investmentService";
import {
	getArchivedSources,
	setSourceArchived,
} from "@/services/sourceService";
import { getArchivedTrips, setTripArchived } from "@/services/tripService";
import type { Category } from "@/types/Category";
import type { Investment } from "@/types/Investment";
import type { RelationKind } from "@/types/RelationKind";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { Source } from "@/types/Source";
import type { Trip } from "@/types/Trip";
import { getErrorMessage } from "@/utils/error";
import { getRelationLabels } from "@/utils/relation";

type ArchivedRelationsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ArchivedRelations"
>;

type ArchivedEntity = Source | Category | Trip | Investment;

type ArchivedListRow =
	| { type: "header"; key: string; label: string }
	| {
			type: "entity";
			key: string;
			kind: RelationKind;
			entity: ArchivedEntity;
	  };

const KIND_ICON: Record<RelationKind, ComponentProps<typeof Ionicons>["name"]> =
	{
		SOURCE: "wallet-outline",
		CATEGORY: "pricetag-outline",
		TRIP: "airplane-outline",
		INVESTMENT: "trending-up",
	};

const ArchivedRelationsScreen = (
	_props: ArchivedRelationsScreenProps,
): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setError("");
			const [
				loadedSources,
				loadedCategories,
				loadedTrips,
				loadedInvestments,
			] = await Promise.all([
				getArchivedSources(database),
				getArchivedCategories(database),
				getArchivedTrips(database),
				getArchivedInvestments(database),
			]);
			setSources(loadedSources);
			setCategories(loadedCategories);
			setTrips(loadedTrips);
			setInvestments(loadedInvestments);
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useFocusEffect(
		useCallback(() => {
			void getScreenData();
		}, [getScreenData]),
	);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const handleRestore = useCallback(
		async (kind: RelationKind, id: string): Promise<void> => {
			try {
				if (kind === "SOURCE") {
					await setSourceArchived(database, id, false);
				} else if (kind === "CATEGORY") {
					await setCategoryArchived(database, id, false);
				} else if (kind === "TRIP") {
					await setTripArchived(database, id, false);
				} else {
					await setInvestmentArchived(database, id, false);
				}
				refreshData();
				// Restored entities are excluded at the query level here, so
				// reloading immediately removes it from this screen without
				// needing to navigate away and back
				await getScreenData();
			} catch (caughtError: unknown) {
				dialog.showMessage({
					title: "Unable to restore",
					message: getErrorMessage(caughtError),
					variant: "danger",
				});
			}
		},
		[database, dialog, getScreenData, refreshData],
	);

	const handleRestorePress = useCallback(
		(kind: RelationKind, id: string, name: string): void => {
			dialog.confirm({
				title: `Restore "${name}"?`,
				message:
					"It will be visible again in lists and dropdowns everywhere.",
				confirmLabel: "Restore",
				variant: "success",
				onConfirm: () => void handleRestore(kind, id),
			});
		},
		[dialog, handleRestore],
	);

	const listData = useMemo((): readonly ArchivedListRow[] => {
		const query = searchDebounced.trim().toLowerCase();
		const matches = (name: string): boolean =>
			!query || name.toLowerCase().includes(query);

		const rows: ArchivedListRow[] = [];

		const pushGroup = (
			kind: RelationKind,
			entities: readonly ArchivedEntity[],
		): void => {
			const filteredEntities = entities.filter((entity) =>
				matches(entity.name),
			);
			if (filteredEntities.length === 0) {
				return;
			}
			rows.push({
				type: "header",
				key: `header-${kind}`,
				label: getRelationLabels(kind).title,
			});
			for (const entity of filteredEntities) {
				rows.push({
					type: "entity",
					key: `${kind}-${entity.id}`,
					kind,
					entity,
				});
			}
		};

		pushGroup("SOURCE", sources);
		pushGroup("CATEGORY", categories);
		pushGroup("TRIP", trips);
		pushGroup("INVESTMENT", investments);

		return rows;
	}, [categories, investments, searchDebounced, sources, trips]);

	const renderArchivedItem = useCallback(
		({ item }: { item: ArchivedListRow }): React.JSX.Element => {
			if (item.type === "header") {
				return (
					<CustomText style={styles.sectionHeading}>
						{item.label}
					</CustomText>
				);
			}
			return (
				<Pressable
					onPress={() =>
						handleRestorePress(
							item.kind,
							item.entity.id,
							item.entity.name,
						)
					}
				>
					<GlassCard>
						<View style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									color={COLORS.textMuted}
									name={KIND_ICON[item.kind]}
									size={20}
								/>
							</View>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{item.entity.name}
								</CustomText>
								<CustomText style={styles.meta}>
									Tap to restore
								</CustomText>
							</View>
							<Ionicons
								color={COLORS.textDim}
								name="refresh-outline"
								size={18}
							/>
						</View>
					</GlassCard>
				</Pressable>
			);
		},
		[handleRestorePress],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<SearchBar
					autoFocus={false}
					onChangeText={setSearchQuery}
					placeholder="Search archived relations..."
					value={searchQuery}
				/>
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, searchQuery],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="archive-outline"
				message={
					searchDebounced.trim()
						? "No archived relations match your search."
						: "Anything you archive from Sources, Categories, Trips or Investments will show up here."
				}
				title="No archived relations"
			/>
		),
		[searchDebounced],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={listData}
				keyExtractor={(row) => row.key}
				renderItem={renderArchivedItem}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	sectionHeading: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "900",
		letterSpacing: 0.6,
		textTransform: "uppercase",
		marginBottom: 6,
		marginTop: 4,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconBox: {
		width: 40,
		height: 40,
		borderRadius: 14,
		backgroundColor: "rgba(255,255,255,0.055)",
		alignItems: "center",
		justifyContent: "center",
	},
	details: {
		flex: 1,
		gap: 2,
	},
	title: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
});

export { ArchivedRelationsScreen };
