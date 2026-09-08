import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Decimal from "decimal.js";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import HeaderIconButton from "@/components/HeaderIconButton";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import SearchBar from "@/components/SearchBar";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import exchangeRateService from "@/services/exchangeRateService";
import settingsService from "@/services/settingsService";
import sourceService from "@/services/sourceService";
import type ExchangeRate from "@/types/ExchangeRate";
import type Source from "@/types/Source";
import type SourcesScreenProps from "@/types/SourcesScreenProps";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
const { getExchangeRates } = exchangeRateService;
const { getNativeCurrencyDisplay, updateNativeCurrencyDisplay } =
	settingsService;
const { getSources, setSourceArchived, validateSource } = sourceService;
const { formatMoney } = moneyUtils;

const SourcesScreen = ({
	navigation,
}: SourcesScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [exchangeRates, setExchangeRates] = useState<readonly ExchangeRate[]>(
		[],
	);
	const [error, setError] = useState("");
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setError("");
			const [nativeCurrency, loadedRates, loadedSources] =
				await Promise.all([
					getNativeCurrencyDisplay(database),
					getExchangeRates(database),
					getSources(database),
				]);
			setIsNativeCurrency(nativeCurrency);
			setExchangeRates(loadedRates);
			setSources(loadedSources);
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useFocusEffect(
		useCallback(() => {
			void getScreenData();
		}, [getScreenData]),
	);

	const handleToggleCurrency = useCallback(async (): Promise<void> => {
		const nextValue = !isNativeCurrency;
		await updateNativeCurrencyDisplay(database, nextValue);
		setIsNativeCurrency(nextValue);
		await getScreenData();
	}, [database, getScreenData, isNativeCurrency]);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={{ flexDirection: "row", gap: 4 }}>
					<HeaderIconButton
						accessibilityLabel={
							searchVisible ? "Close search" : "Search"
						}
						icon={
							searchVisible ? "close-outline" : "search-outline"
						}
						isActive={searchVisible}
						onPress={() => {
							setSearchVisible((v) => !v);
							setSearchQuery("");
							setSearchDebounced("");
						}}
					/>
					<HeaderIconButton
						accessibilityLabel={
							isNativeCurrency
								? "Convert to INR"
								: "Show native currencies"
						}
						icon="earth-outline"
						isActive={!isNativeCurrency}
						onPress={() => void handleToggleCurrency()}
					/>
				</View>
			),
		});
	}, [handleToggleCurrency, isNativeCurrency, navigation, searchVisible]);

	const handleValidate = useCallback(
		async (id: string): Promise<void> => {
			try {
				await validateSource(database, id);
				refreshData();
				// Immediately reload so the validated badge appears without
				// needing to navigate away and back
				await getScreenData();
			} catch (caughtError: unknown) {
				dialog.showMessage({
					title: "Unable to validate",
					message: getErrorMessage(caughtError),
					variant: "danger",
				});
			}
		},
		[database, dialog, getScreenData, refreshData],
	);

	const handleArchive = useCallback(
		async (id: string): Promise<void> => {
			try {
				await setSourceArchived(database, id, true);
				refreshData();
				// Archived sources are excluded at the query level, so
				// reloading immediately removes it from view
				await getScreenData();
			} catch (caughtError: unknown) {
				dialog.showMessage({
					title: "Unable to archive",
					message: getErrorMessage(caughtError),
					variant: "danger",
				});
			}
		},
		[database, dialog, getScreenData, refreshData],
	);

	const handleArchivePress = useCallback(
		(id: string, name: string): void => {
			dialog.confirm({
				title: `Archive "${name}"?`,
				message:
					"It will be hidden from lists and dropdowns everywhere. You can restore it anytime from Settings \u2192 Archived relations.",
				confirmLabel: "Archive",
				variant: "danger",
				onConfirm: () => void handleArchive(id),
			});
		},
		[dialog, handleArchive],
	);

	const rateMap = useMemo((): Map<string, Decimal> => {
		const map = new Map<string, Decimal>();
		for (const rate of exchangeRates) {
			map.set(rate.currencyCode, new Decimal(rate.rateToInr));
		}
		map.set("INR", new Decimal(1));
		return map;
	}, [exchangeRates]);

	const toInr = useCallback(
		(amount: string, currencyCode: string): Decimal => {
			const rate = rateMap.get(currencyCode);
			if (!rate) {
				// Unknown currency rates are excluded from converted totals.
				return new Decimal(0);
			}
			return new Decimal(amount).times(rate);
		},
		[rateMap],
	);

	const listData = useMemo(
		() =>
			[...sources].sort((a, b) =>
				toInr(a.balance, a.currencyCode).comparedTo(
					toInr(b.balance, b.currencyCode),
				),
			),
		[sources, toInr],
	);

	const filteredListData = useMemo(() => {
		if (!searchDebounced.trim()) return listData;
		const q = searchDebounced.trim().toLowerCase();
		return listData.filter((source) =>
			source.name.toLowerCase().includes(q),
		);
	}, [listData, searchDebounced]);

	const renderSourceItem = useCallback(
		({ item: source }: { item: Source }): React.JSX.Element => {
			const isValidated =
				source.validatedAt !== null &&
				(source.latestTransactionCreatedAt === null ||
					source.validatedAt >= source.latestTransactionCreatedAt);
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: "SOURCE",
							entityId: source.id,
							entityName: source.name,
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
								<CustomText style={styles.title}>
									{source.name}
								</CustomText>
								<CustomText style={styles.meta}>
									{source.currencyCode}
								</CustomText>
								<CustomText style={styles.amount}>
									{formatMoney(
										source.balance,
										source.currencyCode,
									)}
								</CustomText>
								{!isNativeCurrency &&
								source.currencyCode !== "INR"
									? (() => {
											const inrVal = toInr(
												source.balance,
												source.currencyCode,
											);
											if (inrVal.isZero()) return null;
											const isPositive = inrVal.gte(0);
											return (
												<CustomText
													style={[
														styles.convertedAmount,
														{
															color: isPositive
																? COLORS.success
																: COLORS.danger,
														},
													]}
												>
													{"≈ "}
													{formatMoney(
														inrVal.abs().toFixed(),
														"INR",
													)}
												</CustomText>
											);
										})()
									: null}
							</View>
						</View>
						<View style={styles.actions}>
							<Pressable
								accessibilityLabel="Validate"
								accessibilityRole="button"
								hitSlop={8}
								onPress={() => void handleValidate(source.id)}
								style={({ pressed }) => [
									styles.actionIcon,
									styles.actionIconSuccess,
									pressed && styles.actionIconPressed,
								]}
							>
								<Ionicons
									color={COLORS.success}
									name="checkmark-done"
									size={17}
								/>
							</Pressable>
							<Pressable
								accessibilityLabel="Archive"
								accessibilityRole="button"
								hitSlop={8}
								onPress={() =>
									handleArchivePress(source.id, source.name)
								}
								style={({ pressed }) => [
									styles.actionIcon,
									pressed && styles.actionIconPressed,
								]}
							>
								<Ionicons
									color={COLORS.textMuted}
									name="archive-outline"
									size={17}
								/>
							</Pressable>
						</View>
					</GlassCard>
				</Pressable>
			);
		},
		[
			handleArchivePress,
			handleValidate,
			isNativeCurrency,
			navigation,
			toInr,
		],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder="Search sources..."
						value={searchQuery}
					/>
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, searchQuery, searchVisible],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="add-circle-outline"
				message="Add your first source to get started."
				title="No sources yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredListData}
				extraData={[isNativeCurrency, searchDebounced]}
				keyExtractor={(source) => source.id}
				renderItem={renderSourceItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("SourceForm")}
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
	convertedAmount: {
		fontSize: 13,
		fontWeight: "900",
		marginTop: 1,
	},
	actions: {
		marginTop: 12,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
	},
	actionIcon: {
		width: 34,
		height: 34,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.055)",
	},
	actionIconSuccess: {
		borderColor: "rgba(82, 214, 163, 0.36)",
		backgroundColor: COLORS.successMuted,
	},
	actionIconPressed: {
		transform: [{ scale: 0.92 }],
	},
});

export default SourcesScreen;
