import { useQuery } from "@realm/react";
import { FlatList } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TransactionModel from "../../../models/TransactionModel";
import TransactionRoutes from "./TransactionRoutes";
import TransactionRenderItem from "./TransactionRenderItem";

const TransactionMain = () => {
	const transactions = useQuery(TransactionModel);
	console.log(transactions);
	return (
		<ScreenLayout>
			<FlatList data={transactions} renderItem={TransactionRenderItem} />
			<PlusButton to={TransactionRoutes.Add} />
		</ScreenLayout>
	);
};

export default TransactionMain;
