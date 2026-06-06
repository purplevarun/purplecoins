import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
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

	const handleToggleCurrency = async (): Promise<void> => {
		const nextValue = !isNativeCurrency;
		await updateNativeCurrencyDisplay(database, nextValue);
		setIsNativeCurrency(nextValue);
		await getScreenData();
	};

	const handleDelete = (id: string, name: string): void => {
		Alert.alert(`Delete ${name}?`, "This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					const processDelete = async (): Promise<void> => {
						try {
							if (kind === "SOURCE") {
								await deleteSource(database, id);
							} else if (kind === "CATEGORY") {
								await deleteCategory(database, id);
							} else if (kind === "TRIP") {
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
	};

	const handleValidate = async (id: string): Promise<void> => {
		try {
			await validateSource(database, id);
			refreshData();
		} catch (caughtError: unknown) {
			Alert.alert("Unable to validate", getErrorMessage(caughtError));
		}
	};

	const renderSource = (source: Source): React.JSX.Element => {
		const isValidated =
			source.validatedAt !== null &&
			(source.latestTransactionCreatedAt === null ||
				source.validatedAt >= source.latestTransactionCreatedAt);
		return (
			<Pressable
				key={source.id}
				onPress={() =>
					navigation.navigate("RelationForm", {
						kind,
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
								<Text style={styles.title}>{source.name}</Text>
								{isValidated ? (
									<View style={styles.validatedBadge}>
										<Ionicons
											color={COLORS.success}
											name="checkmark-circle"
											size={14}
										/>
										<Text style={styles.validatedText}>
											Validated
										</Text>
									</View>
								) : null}
							</View>
							<Text style={styles.meta}>
								{source.currencyCode}
							</Text>
							<Text style={styles.amount}>
								{formatMoney(
									source.balance,
									source.currencyCode,
								)}
							</Text>
						</View>
					</View>
					<View style={styles.actions}>
						<AppButton
							icon="checkmark-done"
							isCompact
							label="Validate"
							onPress={() => void handleValidate(source.id)}
							variant="success"
						/>
						<AppButton
							icon="trash-outline"
							isCompact
							label="Delete"
							onPress={() => handleDelete(source.id, source.name)}
							variant="danger"
						/>
					</View>
				</GlassCard>
			</Pressable>
		);
	};

	const renderCategory = (category: Category): React.JSX.Element => {
		const totals =
			analysis?.categories.filter(
				(row) => row.categoryId === category.id,
			) ?? [];
		return (
			<Pressable
				key={category.id}
				onPress={() =>
					navigation.navigate("RelationForm", {
						kind,
						entityId: category.id,
					})
				}
			>
				<GlassCard accent={category.isIncome ? "success" : "default"}>
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
							<Text style={styles.title}>{category.name}</Text>
							<Text style={styles.meta}>
								{category.isIncome
									? "Income category"
									: "Expense category"}
							</Text>
							{totals.length === 0 ? (
								<Text style={styles.amount}>
									{formatMoney(
										ZERO_AMOUNT,
										isNativeCurrency ? "INR" : "INR",
									)}
								</Text>
							) : (
								totals.map((total) => (
									<Text
										key={total.currencyCode}
										style={[
											styles.amount,
											{
												color:
													Number(total.net) >= 0
														? COLORS.success
														: COLORS.danger,
											},
										]}
									>
										{formatMoney(
											total.net,
											total.currencyCode,
										)}
									</Text>
								))
							)}
						</View>
						<AppButton
							icon="trash-outline"
							isCompact
							label="Delete"
							onPress={() =>
								handleDelete(category.id, category.name)
							}
							variant="danger"
						/>
					</View>
				</GlassCard>
			</Pressable>
		);
	};

	const renderSimpleEntity = (
		entity: Trip | Investment,
	): React.JSX.Element => {
		const investmentTotals =
			kind === "INVESTMENT"
				? (analysis?.investments.filter(
						(row) => row.investmentId === entity.id,
					) ?? [])
				: [];
		return (
			<Pressable
				key={entity.id}
				onPress={() =>
					navigation.navigate("RelationForm", {
						kind,
						entityId: entity.id,
					})
				}
			>
				<GlassCard>
					<View style={styles.row}>
						<View style={styles.iconBox}>
							<Ionicons
								color={
									kind === "TRIP"
										? COLORS.blue
										: COLORS.success
								}
								name={
									kind === "TRIP"
										? "airplane-outline"
										: "trending-up"
								}
								size={22}
							/>
						</View>
						<View style={styles.details}>
							<Text style={styles.title}>{entity.name}</Text>
							{investmentTotals.map((total) => (
								<View
									key={total.currencyCode}
									style={styles.investmentTotals}
								>
									<Text style={styles.meta}>
										Invested{" "}
										{formatMoney(
											total.totalInvested,
											total.currencyCode,
										)}
									</Text>
									<Text style={styles.meta}>
										Redeemed{" "}
										{formatMoney(
											total.totalRedeemed,
											total.currencyCode,
										)}
									</Text>
									<Text style={styles.amount}>
										{getInvestmentNetLabel(total.net)}{" "}
										{formatMoney(
											getInvestmentNetAmount(total.net),
											total.currencyCode,
										)}
									</Text>
								</View>
							))}
						</View>
						<AppButton
							icon="trash-outline"
							isCompact
							label="Delete"
							onPress={() => handleDelete(entity.id, entity.name)}
							variant="danger"
						/>
					</View>
				</GlassCard>
			</Pressable>
		);
	};

	const itemCount =
		kind === "SOURCE"
			? sources.length
			: kind === "CATEGORY"
				? categories.length
				: kind === "TRIP"
					? trips.length
					: investments.length;
	const relationLabels = getRelationLabels(kind);

	return (
		<View style={styles.screen}>
			<ScreenContainer>
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
				{itemCount === 0 ? (
					<EmptyState
						icon="add-circle-outline"
						message={`Add your first ${relationLabels.singular} to get started.`}
						title={`No ${relationLabels.plural} yet`}
					/>
				) : null}
				{kind === "SOURCE" ? sources.map(renderSource) : null}
				{kind === "CATEGORY" ? categories.map(renderCategory) : null}
				{kind === "TRIP" ? trips.map(renderSimpleEntity) : null}
				{kind === "INVESTMENT"
					? investments.map(renderSimpleEntity)
					: null}
			</ScreenContainer>
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
