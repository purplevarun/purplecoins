import { useQuery } from "@realm/react";
import { FlatList, View } from "react-native";
import ComponentLayout from "../../../components/Component.Layout";
import ComponentText from "../../../components/Component.Text";
import ComponentPlusButton from "../../../components/Component.PlusButton";
import TransactionModel from "../../../models/TransactionModel";

const ScreenFinanceTransactionMain = () => {
	const transactions = useQuery(TransactionModel);
	console.log(transactions);
	return (
		<ComponentLayout>
			<FlatList
				data={transactions}
				renderItem={({ item }) => (
					<View>
						<ComponentText text={"amount = " + item.amount} />
					</View>
				)}
			/>
			<ComponentPlusButton />
		</ComponentLayout>
	);
};

export default ScreenFinanceTransactionMain;
