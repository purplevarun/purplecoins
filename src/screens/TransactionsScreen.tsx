import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TransactionCard } from "@/components/TransactionCard";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { getTransactions } from "@/services/transactionService";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { SelectOption } from "@/types/SelectOption";
import type { Transaction } from "@/types/Transaction";
import { getErrorMessage } from "@/utils/error";

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

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setTransactions(await getTransactions(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const filteredTransactions = useMemo(
		() =>
			transactions.filter((transaction) => {
				return (
					filter === "ALL" || transaction.classification === filter
				);
			}),
		[filter, transactions],
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
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, filter],
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

export { TransactionsScreen };
