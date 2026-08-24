import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { StyleSheet, View } from "react-native";

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
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import type Transaction from "@/types/Transaction";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import moneyUtils from "@/utils/money";
import runAfterRender from "@/utils/runAfterRender";
const { getTransactionDisplayReason, getTransactions } = transactionService;
const { formatDate } = dateUtils;
const { formatMoney } = moneyUtils;

type TransactionsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Transactions"
>;

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

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setTransactions(await getTransactions(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchQuery), 250);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderIconButton
					accessibilityLabel={
						searchVisible ? "Close search" : "Search"
					}
					icon={searchVisible ? "close-outline" : "search-outline"}
					isActive={searchVisible}
					onPress={() => {
						setSearchVisible((v) => !v);
						setSearchQuery("");
						setSearchDebounced("");
					}}
				/>
			),
		});
	}, [navigation, searchVisible]);

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
		[error, filter, searchQuery, searchVisible],
	);

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
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={filteredTransactions}
				keyExtractor={(transaction) => transaction.id}
				renderItem={renderTransaction}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("TransactionForm")}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
});

export default TransactionsScreen;
