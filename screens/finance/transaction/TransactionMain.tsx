import { useQuery } from "@realm/react";
import { FlatList, View } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import PlusButton from "../../../components/PlusButton";
import TransactionModel from "../../../models/TransactionModel";

const TransactionMain = () => {
	const transactions = useQuery(TransactionModel);
	console.log(transactions);
	return (
		<ScreenLayout>
			<FlatList
				data={transactions}
				renderItem={({ item }) => (
					<View>
						<CustomText text={"amount = " + item.amount} />
					</View>
				)}
			/>
			<PlusButton to={"Transaction.Add"} />
		</ScreenLayout>
	);
};

export default TransactionMain;
