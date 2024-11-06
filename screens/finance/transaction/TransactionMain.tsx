import { useQuery } from "@realm/react";
import { FlatList } from "react-native";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import TransactionModel from "../../../models/TransactionModel";
import TransactionRoutes from "./TransactionRoutes";
import TransactionRenderItem from "./TransactionRenderItem";
import SourceModel from "../../../models/SourceModel";
import CategoryModel from "../../../models/CategoryModel";
import InvestmentModel from "../../../models/InvestmentModel";
import TripModel from "../../../models/TripModel";
import tripModel from "../../../models/TripModel";

const TransactionMain = () => {
	const transactionModels = useQuery(TransactionModel);
	const sourceModels = useQuery(SourceModel);
	const categoryModels = useQuery(CategoryModel);
	const investmentModels = useQuery(InvestmentModel);
	const tripModels = useQuery(TripModel);
	console.log(JSON.stringify(transactionModels, null, 2));

	return (
		<ScreenLayout>
			<FlatList
				data={transactionModels}
				renderItem={({ item }) => (
					<TransactionRenderItem
						item={item}
						sourceModels={sourceModels}
						categoryModels={categoryModels}
						investmentModels={investmentModels}
						tripModels={tripModels}
					/>
				)}
			/>
			<PlusButton to={TransactionRoutes.Add} />
		</ScreenLayout>
	);
};

export default TransactionMain;
