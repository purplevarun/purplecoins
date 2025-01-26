import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { transactionRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import ITransaction from "./ITransaction";
import TransactionRenderItem from "./TransactionRenderItem";

const TransactionMain = () => {
	const [transactions, setTransactions] = useState<ITransaction[]>([]);
	const { navigate } = useScreen();
	const { fetchAllTransactions } = useDatabase();
	const handlePlus = () => navigate(transactionRoutes.add);

	useFocus(() => setTransactions(fetchAllTransactions()));

	if (transactions.length === 0) return <NoContent handlePlus={handlePlus} />;
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<FlashList
				data={transactions}
				renderItem={TransactionRenderItem}
				estimatedItemSize={1000}
			/>
		</ScreenLayout>
	);
};

export default TransactionMain;
