import { FlatList } from "react-native";
import TransactionRoutes from "./TransactionRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TransactionRenderItem from "./TransactionRenderItem";
import NoContent from "../../other/NoContent";
import useDatabase from "../../../util/DatabaseFunctions";

const TransactionMain = () => {
	const { transactions } = useDatabase();
	return (
		<ScreenLayout>
			{transactions.length === 0 ? (
				<NoContent transactions />
			) : (
				<FlatList
					data={transactions}
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
