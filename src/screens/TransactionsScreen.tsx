import { Ionicons } from "@expo/vector-icons";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import CustomText from "@/components/CustomText";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import HeaderIconButton from "@/components/HeaderIconButton";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import SearchBar from "@/components/SearchBar";
import SegmentedControl from "@/components/SegmentedControl";
import TransactionCard from "@/components/TransactionCard";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import transactionService from "@/services/transactionService";
import type SelectOption from "@/types/SelectOption";
import type Transaction from "@/types/Transaction";
import type TransactionCursor from "@/types/TransactionCursor";
import type TransactionsScreenProps from "@/types/TransactionsScreenProps";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";
const { getTransactionDisplayReason, getTransactionPage, getTransactions } =
	transactionService;
const { formatDate, getDayDateRange, shiftDay } = dateUtils;
const { formatMoney } = moneyUtils;

const FILTER_OPTIONS: readonly SelectOption[] = [
	{ label: "All", value: "ALL" },
	{ label: "General", value: "GENERAL" },
	{ label: "Investment", value: "INVESTMENT" },
];

const TransactionsScreen = ({
	navigation,
}: TransactionsScreenProps): React.JSX.Element => {
	const { database, dataVersion } = useDatabaseContext();
	const [transactions, setTransactions] = useState<readonly Transaction[]>(
		[],
	);
	const [filter, setFilter] = useState("ALL");
	const [error, setError] = useState("");
	const [searchVisible, setSearchVisible] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const activeDate = useMemo(
		() => (selectedDate instanceof Date ? selectedDate : new Date()),
		[selectedDate],
	);
	const [viewMode, setViewMode] = useState<"DAY" | "SCROLL">("SCROLL");
	const [paging, setPaging] = useState({
		hasMore: false,
		isLoading: true,
	});
	const pagination = useRef({
		requestId: 0,
		loading: false,
		cursor: undefined as TransactionCursor | undefined,
	});

	const getScreenData = useCallback(
		async (append = false): Promise<void> => {
			if (pagination.current.loading) return;
			const requestId = ++pagination.current.requestId;
			pagination.current.loading = true;
			setPaging((current) => ({ ...current, isLoading: true }));
			try {
				const page =
					viewMode === "DAY"
						? {
								transactions: await getTransactions(
									database,
									getDayDateRange(activeDate),
								),
								hasMore: false,
							}
						: await getTransactionPage(
								database,
								append ? pagination.current.cursor : undefined,
							);
				if (requestId !== pagination.current.requestId) return;
				setTransactions((current) =>
					append
						? [...current, ...page.transactions]
						: page.transactions,
				);
				pagination.current.cursor = page.transactions.at(-1);
				setPaging((current) => ({
					...current,
					hasMore: page.hasMore,
				}));
				setError("");
			} catch (caughtError: unknown) {
				if (requestId === pagination.current.requestId) {
					setError(getErrorMessage(caughtError));
				}
			} finally {
				if (requestId === pagination.current.requestId) {
					pagination.current.loading = false;
					setPaging((current) => ({ ...current, isLoading: false }));
				}
			}
		},
		[activeDate, database, viewMode],
	);

	useEffect(() => {
		pagination.current = {
			requestId: pagination.current.requestId + 1,
			loading: false,
			cursor: undefined,
		};
		const cancel = runAfterRender(() => {
			setTransactions([]);
			setPaging({ hasMore: false, isLoading: true });
			setError("");
			void getScreenData();
		});
		return () => {
			cancel();
			pagination.current.requestId += 1;
			pagination.current.loading = false;
		};
	}, [dataVersion, getScreenData]);

	const isToday = activeDate.toDateString() === new Date().toDateString();
	const handleDayChange = useCallback((direction: -1 | 1): void => {
		setSelectedDate((currentDate) => shiftDay(currentDate, direction));
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={styles.headerActions}>
					<HeaderIconButton
						accessibilityLabel={
							viewMode === "DAY"
								? "Switch to scroll view"
								: "Switch to day view"
						}
						icon={
							viewMode === "DAY"
								? "list-outline"
								: "calendar-outline"
						}
						isActive={viewMode === "SCROLL"}
						onPress={() => {
							setViewMode((current) =>
								current === "DAY" ? "SCROLL" : "DAY",
							);
						}}
					/>
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
				</View>
			),
		});
	}, [navigation, searchVisible, viewMode]);

	const filteredTransactions = useMemo(() => {
		let list = transactions;
		if (filter !== "ALL") {
			list = list.filter((t) => t.classification === filter);
		}
		if (searchDebounced.trim()) {
			const q = searchDebounced.trim().toLowerCase().replace(/,/g, "");
			list = list.filter((t) => {
				const amount = t.amount.replace(/,/g, "");
				return (
					getTransactionDisplayReason(t).toLowerCase().includes(q) ||
					t.sourceName.toLowerCase().includes(q) ||
					amount.includes(q) ||
					(t.categoryName ?? "").toLowerCase().includes(q) ||
					(t.tripName ?? "").toLowerCase().includes(q) ||
					(t.investmentName ?? "").toLowerCase().includes(q) ||
					formatDate(t.transactionAt).toLowerCase().includes(q) ||
					formatMoney(t.amount, t.sourceCurrencyCode)
						.replace(/,/g, "")
						.includes(q)
				);
			});
		}
		return list;
	}, [filter, transactions, searchDebounced]);

	const renderTransaction = useCallback(
		({ item: transaction }: { item: Transaction }): React.JSX.Element => (
			<TransactionCard
				transaction={transaction}
				onPress={() =>
					navigation.navigate("TransactionForm", {
						transactionId: transaction.id,
					})
				}
				onLongPress={() =>
					navigation.navigate("TransactionForm", {
						cloneFromTransactionId: transaction.id,
					})
				}
			/>
		),
		[navigation],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				{viewMode === "DAY" ? (
					<View style={styles.dayRow}>
						<Pressable
							accessibilityLabel="Previous day"
							accessibilityRole="button"
							onPress={() => handleDayChange(-1)}
							style={styles.dayButton}
						>
							<Ionicons
								color={COLORS.text}
								name="chevron-back"
								size={21}
							/>
						</Pressable>
						<CustomText style={styles.dayLabel}>
							{formatDate(getDayDateRange(activeDate).start)}
						</CustomText>
						<Pressable
							accessibilityLabel="Next day"
							accessibilityRole="button"
							disabled={isToday}
							onPress={() => handleDayChange(1)}
							style={[
								styles.dayButton,
								isToday && styles.dayButtonDisabled,
							]}
						>
							<Ionicons
								color={isToday ? COLORS.textDim : COLORS.text}
								name="chevron-forward"
								size={21}
							/>
						</Pressable>
					</View>
				) : null}
				<SegmentedControl
					onChange={setFilter}
					options={FILTER_OPTIONS}
					value={filter}
				/>
				{searchVisible ? (
					<SearchBar
						onChangeText={setSearchQuery}
						placeholder="Search transactions..."
						value={searchQuery}
					/>
				) : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[
			error,
			filter,
			handleDayChange,
			isToday,
			searchQuery,
			searchVisible,
			activeDate,
			viewMode,
		],
	);

	const listFooter = useMemo(() => {
		if (paging.isLoading) {
			return (
				<ActivityIndicator
					accessibilityLabel="Loading transactions"
					color={COLORS.primary}
					style={styles.footer}
				/>
			);
		}
		if (error) {
			return (
				<AppButton
					icon="refresh-outline"
					label="Retry"
					onPress={() => {
						void getScreenData(viewMode === "SCROLL");
					}}
					style={styles.footer}
					variant="secondary"
				/>
			);
		}
		if (viewMode === "DAY") return null;
		return paging.hasMore ? (
			<AppButton
				icon="chevron-down-outline"
				label="Load more"
				onPress={() => {
					void getScreenData(true);
				}}
				style={styles.footer}
				variant="secondary"
			/>
		) : (
			<CustomText style={styles.endLabel}>
				No older transactions
			</CustomText>
		);
	}, [error, getScreenData, paging.hasMore, paging.isLoading, viewMode]);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="swap-horizontal-outline"
				message="Add a general or investment transaction."
				title="No transactions found"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				key={`${viewMode}:${activeDate.getTime()}:${dataVersion}`}
				ListEmptyComponent={
					paging.isLoading || error ? null : listEmpty
				}
				ListFooterComponent={listFooter}
				ListHeaderComponent={listHeader}
				data={filteredTransactions}
				keyExtractor={(transaction) => transaction.id}
				renderItem={renderTransaction}
			/>
			<FloatingAddButton
				onPress={() =>
					navigation.navigate("TransactionForm", {
						initialTransactionAt: activeDate.getTime(),
					})
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	headerActions: {
		flexDirection: "row",
		gap: 8,
	},
	footer: {
		marginTop: 16,
		minHeight: 50,
	},
	endLabel: {
		color: COLORS.textDim,
		fontSize: 13,
		textAlign: "center",
		marginTop: 24,
	},
	dayRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	dayButton: {
		width: 40,
		height: 40,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.055)",
	},
	dayButtonDisabled: {
		opacity: 0.45,
	},
	dayLabel: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "800",
	},
});

export default TransactionsScreen;
