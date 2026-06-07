import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
} from "@/services/analysisService";
import { deleteCategory, getCategories } from "@/services/categoryService";
import { deleteInvestment, getInvestments } from "@/services/investmentService";
import {
	getNativeCurrencyDisplay,
	updateNativeCurrencyDisplay,
} from "@/services/settingsService";
import {
	deleteSource,
	getSources,
	validateSource,
} from "@/services/sourceService";
import { deleteTrip, getTrips } from "@/services/tripService";
import type { AnalysisSummary } from "@/types/AnalysisSummary";
import type { Category } from "@/types/Category";
import type { Investment } from "@/types/Investment";
import type { RelationKind } from "@/types/RelationKind";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { Source } from "@/types/Source";
import type { Trip } from "@/types/Trip";
import { getErrorMessage } from "@/utils/error";
import { formatMoney, ZERO_AMOUNT } from "@/utils/money";
import { getRelationLabels } from "@/utils/relation";

type RelationsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Relations"
>;

type RelationListItem =
	| { kind: "SOURCE"; entity: Source }
	| { kind: "CATEGORY"; entity: Category }
	| { kind: "TRIP"; entity: Trip }
	| { kind: "INVESTMENT"; entity: Investment };

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;

const RelationsScreen = ({
	navigation,
	route,
}: RelationsScreenProps): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const { kind } = route.params;
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [categories, setCategories] = useState<readonly Category[]>([]);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [investments, setInvestments] = useState<readonly Investment[]>([]);
	const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setError("");
			const nativeCurrency = await getNativeCurrencyDisplay(database);
			setIsNativeCurrency(nativeCurrency);
			if (kind === "SOURCE") {
				setSources(await getSources(database));
				return;
			}
			if (kind === "CATEGORY") {
				const [loadedCategories, loadedAnalysis] = await Promise.all([
					getCategories(database),
					getAnalysisSummary(database, {
						dateRange: {
							start: ALL_TIME_START,
							end: ALL_TIME_END,
						},
						isNativeCurrency: nativeCurrency,
					}),
				]);
				setCategories(loadedCategories);
				setAnalysis(loadedAnalysis);
				return;
			}
			if (kind === "TRIP") {
				setTrips(await getTrips(database));
				return;
			}
			const [loadedInvestments, loadedAnalysis] = await Promise.all([
				getInvestments(database),
				getAnalysisSummary(database, {
					dateRange: { start: ALL_TIME_START, end: ALL_TIME_END },
					isNativeCurrency: nativeCurrency,
				}),
			]);
			setInvestments(loadedInvestments);
			setAnalysis(loadedAnalysis);
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, kind]);

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const handleToggleCurrency = useCallback(async (): Promise<void> => {
		const nextValue = !isNativeCurrency;
		await updateNativeCurrencyDisplay(database, nextValue);
		setIsNativeCurrency(nextValue);
		await getScreenData();
	}, [database, getScreenData, isNativeCurrency]);

	const handleDelete = useCallback(
		(id: string, name: string, relationKind: RelationKind): void => {
			Alert.alert(`Delete ${name}?`, "This action cannot be undone.", [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						const processDelete = async (): Promise<void> => {
							try {
								if (relationKind === "SOURCE") {
									await deleteSource(database, id);
								} else if (relationKind === "CATEGORY") {
									await deleteCategory(database, id);
								} else if (relationKind === "TRIP") {
									await deleteTrip(database, id);
								} else {
									await deleteInvestment(database, id);
								}
								refreshData();
							} catch (caughtError: unknown) {
								Alert.alert(
									"Unable to delete",
									getErrorMessage(caughtError),
								);
							}
						};
						void processDelete();
					},
				},
			]);
		},
		[database, refreshData],
	);

	const handleValidate = useCallback(
		async (id: string): Promise<void> => {
			try {
				await validateSource(database, id);
				refreshData();
			} catch (caughtError: unknown) {
				Alert.alert("Unable to validate", getErrorMessage(caughtError));
			}
		},
		[database, refreshData],
	);

	const listData = useMemo((): readonly RelationListItem[] => {
		if (kind === "SOURCE") {
			return sources.map((entity) => ({
				kind: "SOURCE" as const,
				entity,
			}));
		}
		if (kind === "CATEGORY") {
			return categories.map((entity) => ({
				kind: "CATEGORY" as const,
				entity,
			}));
		}
		if (kind === "TRIP") {
			return trips.map((entity) => ({ kind: "TRIP" as const, entity }));
		}
		return investments.map((entity) => ({
			kind: "INVESTMENT" as const,
			entity,
		}));
	}, [categories, investments, kind, sources, trips]);

	const renderRelationItem = useCallback(
		({ item }: { item: RelationListItem }): React.JSX.Element => {
			if (item.kind === "SOURCE") {
				const source = item.entity;
				const isValidated =
					source.validatedAt !== null &&
					(source.latestTransactionCreatedAt === null ||
						source.validatedAt >=
							source.latestTransactionCreatedAt);
				return (
					<Pressable
						onPress={() =>
							navigation.navigate("RelationForm", {
								kind: "SOURCE",
								entityId: source.id,
							})
						}
					>
						<GlassCard accent={isValidated ? "success" : "default"}>
							<View style={styles.row}>
								<View style={styles.iconBox}>
									<Ionicons
										color={COLORS.blue}
										name="wallet-outline"
										size={22}
									/>
								</View>
								<View style={styles.details}>
									<View style={styles.titleRow}>
										<CustomText style={styles.title}>
											{source.name}
										</CustomText>
										{isValidated ? (
											<View style={styles.validatedBadge}>
												<Ionicons
													color={COLORS.success}
													name="checkmark-circle"
													size={14}
												/>
												<CustomText
													style={styles.validatedText}
												>
													Validated
												</CustomText>
											</View>
										) : null}
									</View>
									<CustomText style={styles.meta}>
										{source.currencyCode}
									</CustomText>
									<CustomText style={styles.amount}>
										{formatMoney(
											source.balance,
											source.currencyCode,
										)}
									</CustomText>
								</View>
							</View>
							<View style={styles.actions}>
								<AppButton
									icon="checkmark-done"
									isCompact
									label="Validate"
									onPress={() =>
										void handleValidate(source.id)
									}
									variant="success"
								/>
								<AppButton
									icon="trash-outline"
									isCompact
									label="Delete"
									onPress={() =>
										handleDelete(
											source.id,
											source.name,
											"SOURCE",
										)
									}
									variant="danger"
								/>
							</View>
						</GlassCard>
					</Pressable>
				);
			}
			if (item.kind === "CATEGORY") {
				const category = item.entity;
				const totals =
					analysis?.categories.filter(
						(row) => row.categoryId === category.id,
					) ?? [];
				return (
					<Pressable
						onPress={() =>
							navigation.navigate("RelationForm", {
								kind: "CATEGORY",
								entityId: category.id,
							})
						}
					>
						<GlassCard
							accent={category.isIncome ? "success" : "default"}
						>
							<View style={styles.row}>
								<View style={styles.iconBox}>
									<Ionicons
										color={
											category.isIncome
												? COLORS.success
												: COLORS.warning
										}
										name={
											category.isIncome
												? "arrow-down-circle-outline"
												: "pricetag-outline"
										}
										size={22}
									/>
								</View>
								<View style={styles.details}>
									<CustomText style={styles.title}>
										{category.name}
									</CustomText>
									<CustomText style={styles.meta}>
										{category.isIncome
											? "Income category"
											: "Expense category"}
									</CustomText>
									{totals.length === 0 ? (
										<CustomText style={styles.amount}>
											{formatMoney(
												ZERO_AMOUNT,
												isNativeCurrency
													? "INR"
													: "INR",
											)}
										</CustomText>
									) : (
										totals.map((total) => (
											<CustomText
												key={total.currencyCode}
												style={[
													styles.amount,
													{
														color:
															Number(total.net) >=
															0
																? COLORS.success
																: COLORS.danger,
													},
												]}
											>
												{formatMoney(
													total.net,
													total.currencyCode,
												)}
											</CustomText>
										))
									)}
								</View>
								<AppButton
									icon="trash-outline"
									isCompact
									label="Delete"
									onPress={() =>
										handleDelete(
											category.id,
											category.name,
											"CATEGORY",
										)
									}
									variant="danger"
								/>
							</View>
						</GlassCard>
					</Pressable>
				);
			}
			const entity = item.entity;
			const investmentTotals =
				item.kind === "INVESTMENT"
					? (analysis?.investments.filter(
							(row) => row.investmentId === entity.id,
						) ?? [])
					: [];
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("RelationForm", {
							kind: item.kind,
							entityId: entity.id,
						})
					}
				>
					<GlassCard>
						<View style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									color={
										item.kind === "TRIP"
											? COLORS.blue
											: COLORS.success
									}
									name={
										item.kind === "TRIP"
											? "airplane-outline"
											: "trending-up"
									}
									size={22}
								/>
							</View>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{entity.name}
								</CustomText>
								{investmentTotals.map((total) => (
									<View
										key={total.currencyCode}
										style={styles.investmentTotals}
									>
										<CustomText style={styles.meta}>
											Invested{" "}
											{formatMoney(
												total.totalInvested,
												total.currencyCode,
											)}
										</CustomText>
										<CustomText style={styles.meta}>
											Redeemed{" "}
											{formatMoney(
												total.totalRedeemed,
												total.currencyCode,
											)}
										</CustomText>
										<CustomText style={styles.amount}>
											{getInvestmentNetLabel(total.net)}{" "}
											{formatMoney(
												getInvestmentNetAmount(
													total.net,
												),
												total.currencyCode,
											)}
										</CustomText>
									</View>
								))}
							</View>
							<AppButton
								icon="trash-outline"
								isCompact
								label="Delete"
								onPress={() =>
									handleDelete(
										entity.id,
										entity.name,
										item.kind,
									)
								}
								variant="danger"
							/>
						</View>
					</GlassCard>
				</Pressable>
			);
		},
		[analysis, handleDelete, handleValidate, isNativeCurrency, navigation],
	);

	const relationLabels = getRelationLabels(kind);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				{kind === "CATEGORY" || kind === "INVESTMENT" ? (
					<CurrencyToggle
						isNativeCurrency={isNativeCurrency}
						onToggle={() => void handleToggleCurrency()}
					/>
				) : null}
				{analysis?.missingCurrencies.length ? (
					<Notice
						message={`Missing INR rates: ${analysis.missingCurrencies.join(", ")}. Those amounts are excluded from converted totals.`}
						tone="warning"
					/>
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[analysis, error, handleToggleCurrency, isNativeCurrency, kind],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="add-circle-outline"
				message={`Add your first ${relationLabels.singular} to get started.`}
				title={`No ${relationLabels.plural} yet`}
			/>
		),
		[relationLabels.plural, relationLabels.singular],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={listData}
				extraData={[analysis, isNativeCurrency]}
				keyExtractor={(item) => item.entity.id}
				renderItem={renderRelationItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("RelationForm", { kind })}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: 15,
		backgroundColor: "rgba(255,255,255,0.055)",
		alignItems: "center",
		justifyContent: "center",
	},
	details: {
		flex: 1,
		gap: 3,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flexWrap: "wrap",
	},
	title: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "900",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
	amount: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
		marginTop: 3,
	},
	validatedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 3,
		backgroundColor: COLORS.successMuted,
	},
	validatedText: {
		color: COLORS.success,
		fontSize: 10,
		fontWeight: "900",
	},
	actions: {
		marginTop: 12,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
	},
	investmentTotals: {
		marginTop: 5,
		gap: 2,
	},
});

export { RelationsScreen };
