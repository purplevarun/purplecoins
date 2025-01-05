import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet } from "react-native";
import Header from "./Header";
import IGroupedTransaction from "./IGroupedTransaction";
import NoContent from "./NoContent";
import ScreenLayout from "./ScreenLayout";
import TransactionSectionList from "./TransactionSectionList";
import useTransactionService from "./TransactionService";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import useFocus from "./useFocus";

const TransactionMain = () => {
	const { fetchGroupedTransactions } = useTransactionService();
	const [transactions, setTransactions] = useState<IGroupedTransaction[]>([]);
	useFocus(() => setTransactions(fetchGroupedTransactions()), []);
	const { navigate } = useNavigation<any>();
	if (transactions.length === 0) return <NoContent />;
	return (
		<ScreenLayout>
			<Header handlePlus={() => navigate("Transaction.Add")} />
			<TransactionSectionList transactions={transactions} />
		</ScreenLayout>
	);
};

const styles = StyleSheet.create({
	header: {
		paddingVertical: PADDING,
		borderRadius: BORDER_RADIUS,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
});

export default TransactionMain;
