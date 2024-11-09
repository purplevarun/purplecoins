import { useQuery } from "@realm/react";
import { FlatList } from "react-native";
import TransactionRoutes from "./TransactionRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TransactionRenderItem from "./TransactionRenderItem";
import NoContent from "../../other/NoContent";
import TransactionModel from "../../../models/TransactionModel";

const TransactionMain = () => {
	const transactionModels = useQuery(TransactionModel);
	console.log(JSON.stringify(transactionModels, null, 2));

	return (
		<ScreenLayout>
			{transactionModels.length === 0 ? (
				<NoContent transactions />
			) : (
				<FlatList
					data={transactionModels}
					renderItem={({ item }) => (
						<TransactionRenderItem item={item} />
					)}
				/>
			)}
			<PlusButton to={TransactionRoutes.Add} />
		</ScreenLayout>
	);
};

export default TransactionMain;
