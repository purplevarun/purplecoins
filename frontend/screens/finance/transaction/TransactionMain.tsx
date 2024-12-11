import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import TransactionRoutes from "./TransactionRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TransactionRenderItem from "./TransactionRenderItem";
import NoContent from "../../other/NoContent";
import useTransactionService from "./TransactionService";
import ITransaction from "../../../interfaces/ITransaction";

const TransactionMain = () => {
	const { fetchTransactions } = useTransactionService();
	const [transactions, setTransactions] = useState<null | ITransaction[]>(null);

	useFocusEffect(useCallback(() => setTransactions(fetchTransactions()), []));

	if (!transactions || transactions.length === 0)
		return <NoContent transactions />;

	return (
		<ScreenLayout>
			<FlatList
				data={transactions}
				renderItem={({ item }) =>
					<TransactionRenderItem item={item} />
				}
			/>
			<PlusButton to={TransactionRoutes.Add} />
		</ScreenLayout>
	);
};

export default TransactionMain;
