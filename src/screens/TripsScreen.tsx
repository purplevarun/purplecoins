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
import tripService from "@/services/tripService";
import tripTotalService from "@/services/tripTotalService";
import type ExchangeRate from "@/types/ExchangeRate";
import type Trip from "@/types/Trip";
import type TripsScreenProps from "@/types/TripsScreenProps";
import type TripTotal from "@/types/TripTotal";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
const { getExchangeRates } = exchangeRateService;
const { getNativeCurrencyDisplay, updateNativeCurrencyDisplay } =
	settingsService;
const { getTrips, setTripArchived } = tripService;
const { getTripTotals } = tripTotalService;
const { compareMoney, formatMoney, ZERO_AMOUNT } = moneyUtils;

const TripsScreen = ({ navigation }: TripsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [tripTotals, setTripTotals] = useState<readonly TripTotal[]>([]);
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
			const [nativeCurrency, loadedRates, loadedTrips, loadedTripTotals] =
				await Promise.all([
					getNativeCurrencyDisplay(database),
					getExchangeRates(database),
					getTrips(database),
					getTripTotals(database),
				]);
			setIsNativeCurrency(nativeCurrency);
			setExchangeRates(loadedRates);
			setTrips(loadedTrips);
			setTripTotals(loadedTripTotals);
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

	const handleArchive = useCallback(
		async (id: string): Promise<void> => {
			try {
				await setTripArchived(database, id, true);
				refreshData();
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
			if (!rate) return new Decimal(0);
			return new Decimal(amount).times(rate);
		},
		[rateMap],
	);

	const listData = useMemo(
		() =>
			[...trips].sort((a, b) => {
				const totalA = tripTotals
					.filter((row) => row.tripId === a.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.total, row.currencyCode)),
						new Decimal(0),
					);
				const totalB = tripTotals
					.filter((row) => row.tripId === b.id)
					.reduce(
						(sum, row) =>
							sum.plus(toInr(row.total, row.currencyCode)),
						new Decimal(0),
					);
				// Trip totals are positive = spent; sort most spent first (descending)
				return totalB.comparedTo(totalA);
			}),
		[toInr, tripTotals, trips],
	);

	const filteredListData = useMemo(() => {
		if (!searchDebounced.trim()) return listData;
		const q = searchDebounced.trim().toLowerCase();
		return listData.filter((trip) => trip.name.toLowerCase().includes(q));
	}, [listData, searchDebounced]);

	const renderTripItem = useCallback(
		({ item: trip }: { item: Trip }): React.JSX.Element => {
			const totals = tripTotals.filter((row) => row.tripId === trip.id);
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("LinkedTransactions", {
							kind: "TRIP",
							entityId: trip.id,
							entityName: trip.name,
						})
					}
				>
					<GlassCard>
						<View style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									color={COLORS.blue}
									name="airplane-outline"
									size={22}
								/>
							</View>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{trip.name}
								</CustomText>
								{totals.length ? (
									totals.map((total) => (
										<CustomText
											key={total.currencyCode}
											style={[
												styles.amount,
												{
													color:
														compareMoney(
															total.total,
															ZERO_AMOUNT,
														) >= 0
															? COLORS.danger
															: COLORS.success,
												},
											]}
										>
											Total{" "}
											{formatMoney(
												total.total,
												total.currencyCode,
											)}
										</CustomText>
									))
								) : (
									<CustomText style={styles.amount}>
										Total {formatMoney(ZERO_AMOUNT, "INR")}
									</CustomText>
								)}
								{!isNativeCurrency &&
								totals.some((t) => t.currencyCode !== "INR")
									? (() => {
											const inrTotal = totals.reduce(
												(sum, t) =>
													sum.plus(
														toInr(
															t.total,
															t.currencyCode,
														),
													),
												new Decimal(0),
											);
											return (
												<CustomText
													style={[
														styles.convertedAmount,
														{
															color: inrTotal.gte(
																0,
															)
																? COLORS.danger
																: COLORS.success,
														},
													]}
												>
													≈{" "}
													{formatMoney(
														inrTotal
															.abs()
															.toFixed(),
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
								accessibilityLabel="Archive"
								accessibilityRole="button"
								hitSlop={8}
								onPress={() =>
									handleArchivePress(trip.id, trip.name)
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
		[handleArchivePress, isNativeCurrency, navigation, toInr, tripTotals],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder="Search trips..."
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
				message="Add your first trip to get started."
				title="No trips yet"
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
				keyExtractor={(trip) => trip.id}
				renderItem={renderTripItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("TripForm")}
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
	actionIconPressed: {
		transform: [{ scale: 0.92 }],
	},
});

export default TripsScreen;
