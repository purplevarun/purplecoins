import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { CustomText } from "@/components/CustomText";
import { EmptyState } from "@/components/EmptyState";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { TransactionCard } from "@/components/TransactionCard";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { deleteCategory } from "@/services/categoryService";
import { deleteInvestment } from "@/services/investmentService";
import { deleteSource } from "@/services/sourceService";
import { getLinkedTransactions } from "@/services/transactionService";
import { deleteTrip } from "@/services/tripService";
import type { RelationKind } from "@/types/RelationKind";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { Transaction } from "@/types/Transaction";
import { getErrorMessage } from "@/utils/error";
import { getRelationLabels } from "@/utils/relation";

type LinkedTransactionsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"LinkedTransactions"
>;

const getRelationIcon = (
	kind: RelationKind,
): React.ComponentProps<typeof Ionicons>["name"] => {
	if (kind === "SOURCE") {
		return "wallet-outline";
	}
	if (kind === "CATEGORY") {
		return "pricetag-outline";
	}
	if (kind === "TRIP") {
		return "airplane-outline";
	}
	return "trending-up";
};

const getRelationColor = (kind: RelationKind): string => {
	if (kind === "SOURCE") {
		return COLORS.blue;
	}
	if (kind === "CATEGORY") {
		return COLORS.warning;
	}
	if (kind === "TRIP") {
		return "#68D5FF";
	}
	return COLORS.success;
};

const LinkedTransactionsScreen = ({
	navigation,
	route,
}: LinkedTransactionsScreenProps): React.JSX.Element => {
	const {
		entityId,
		entityName,
		kind,
		dateRangeStart,
		dateRangeEnd,
		dateRangeLabel,
	} = route.params;
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [error, setError] = useState("");
	const relationLabels = getRelationLabels(kind);

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			const all = await getLinkedTransactions(database, {
				entityId,
				kind,
			});
			// Filter by date range if provided (from Analysis screen drill-down)
			const filtered =
				dateRangeStart !== undefined && dateRangeEnd !== undefined
					? all.filter(
							(t) =>
								t.transactionAt >= dateRangeStart &&
								t.transactionAt <= dateRangeEnd,
						)
					: all;
			setTransactions(filtered);
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, entityId, kind, dateRangeStart, dateRangeEnd]);

	useEffect(() => {
		void getScreenData();
	}, [dataVersion, getScreenData]);

	const processDelete = useCallback(async (): Promise<void> => {
		try {
			if (kind === "SOURCE") {
				await deleteSource(database, entityId);
			} else if (kind === "CATEGORY") {
				await deleteCategory(database, entityId);
			} else if (kind === "TRIP") {
				await deleteTrip(database, entityId);
			} else {
				await deleteInvestment(database, entityId);
			}
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			dialog.showMessage({
				title: "Unable to delete",
				message: getErrorMessage(caughtError),
				variant: "danger",
			});
		}
	}, [database, dialog, entityId, kind, navigation, refreshData]);

	const handleDelete = useCallback((): void => {
		dialog.confirm({
			title: `Delete ${entityName}?`,
			message: `This permanently deletes the ${relationLabels.singular} when it has no linked transactions.`,
			confirmLabel: "Delete",
			variant: "danger",
			onConfirm: () => {
				void processDelete();
			},
		});
	}, [dialog, entityName, processDelete, relationLabels.singular]);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<GlassCard>
					<View style={styles.summaryRow}>
						<View
							style={[
								styles.iconBox,
								{
									backgroundColor: `${getRelationColor(kind)}20`,
								},
							]}
						>
							<Ionicons
								color={getRelationColor(kind)}
								name={getRelationIcon(kind)}
								size={23}
							/>
						</View>
						<View style={styles.summaryDetails}>
							<CustomText style={styles.title}>
								{entityName}
							</CustomText>
							{dateRangeLabel ? (
								<CustomText style={styles.dateRange}>
									{dateRangeLabel}
								</CustomText>
							) : null}
							<CustomText style={styles.subtitle}>
								{transactions.length} linked{" "}
								{transactions.length === 1
									? "transaction"
									: "transactions"}
							</CustomText>
						</View>
					</View>
					<View style={styles.actions}>
						<AppButton
							icon="create-outline"
							isCompact
							label="Edit"
							onPress={() =>
								navigation.navigate("RelationForm", {
									kind,
									entityId,
								})
							}
							variant="secondary"
						/>
						<AppButton
							icon="trash-outline"
							isCompact
							label="Delete"
							onPress={handleDelete}
							variant="danger"
						/>
					</View>
				</GlassCard>
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[
			dateRangeLabel,
			entityId,
			entityName,
			error,
			handleDelete,
			kind,
			navigation,
			transactions.length,
		],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="swap-horizontal-outline"
				message={`No transactions are linked to this ${relationLabels.singular}.`}
				title="No linked transactions"
			/>
		),
		[relationLabels.singular],
	);

	const renderTransaction = useCallback(
		({ item: transaction }: { item: Transaction }): React.JSX.Element => (
			<TransactionCard
				transaction={transaction}
				onPress={() =>
					navigation.navigate("TransactionForm", {
						transactionId: transaction.id,
					})
				}
			/>
		),
		[navigation],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={transactions}
				keyExtractor={(transaction) => transaction.id}
				renderItem={renderTransaction}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	summaryRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	summaryDetails: {
		flex: 1,
		gap: 3,
	},
	title: {
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "900",
	},
	dateRange: {
		color: COLORS.primaryBright,
		fontSize: 11,
		fontWeight: "700",
	},
	subtitle: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
		marginTop: 14,
	},
});

export { LinkedTransactionsScreen };
