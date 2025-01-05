import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import Header from "./Header";
import IGroupedTransaction from "./IGroupedTransaction";
import NoContent from "./NoContent";
import ScreenLayout from "./ScreenLayout";
import TransactionSectionList from "./TransactionSectionList";
import useTransactionService from "./TransactionService";
import useFocus from "./useFocus";

const TransactionMain = () => {
	const { fetchGroupedTransactions } = useTransactionService();
	const [transactions, setTransactions] = useState<IGroupedTransaction[]>([]);
	useFocus(() => setTransactions(fetchGroupedTransactions()), []);
	const { navigate } = useNavigation<any>();
	if (transactions.length === 0)
		return <NoContent handlePlus={() => navigate("Transaction.Add")} />;
	return (
		<ScreenLayout>
			<Header handlePlus={() => navigate("Transaction.Add")} />
			<TransactionSectionList transactions={transactions} />
		</ScreenLayout>
	);
};

export default TransactionMain;
