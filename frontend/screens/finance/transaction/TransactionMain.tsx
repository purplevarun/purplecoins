import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ITransaction } from "../../../util/database/DatabaseSchema";
import { FlatList } from "react-native";
import TransactionRoutes from "./TransactionRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TransactionRenderItem from "./TransactionRenderItem";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/database/DatabaseFunctions";

const TransactionMain = () => {
	const { getTransactions } = useDatabase();
	const [transactions, setTransactions] = useState<null | ITransaction[]>(null);

	useFocusEffect(useCallback(() => {
		setTransactions(getTransactions());
	}, []));

	if (!transactions || transactions.length === 0)
		return <NoContent transactions />;

	return (
		<ScreenLayout>
			<FlatList
				data={transactions}
				renderItem={TransactionRenderItem}
			/>
			<PlusButton to={TransactionRoutes.Add} />
		</ScreenLayout>
	);
};

export default TransactionMain;
