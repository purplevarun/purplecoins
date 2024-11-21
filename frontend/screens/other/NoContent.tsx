import { CENTER, FLEX_ONE } from "../../config/constants.config";
import { BACKGROUND_COLOR, DISABLED_COLOR } from "../../config/colors.config";
import { StyleSheet, View } from "react-native";
import CustomText from "../../components/CustomText";
import PlusButton from "../../components/PlusButton";
import TransactionRoutes from "../finance/transaction/TransactionRoutes";
import CategoryRoutes from "../finance/category/CategoryRoutes";
import TripRoutes from "../finance/trip/TripRoutes";
import InvestmentRoutes from "../finance/investment/InvestmentRoutes";
import SourceRoutes from "../finance/source/SourceRoutes";

type INoContent = {
	transactions?: boolean,
	categories?: boolean,
	trips?: boolean,
	investments?: boolean,
	sources?: boolean
};

const NoContent = ({ transactions, categories, trips, investments, sources }: INoContent) => {
	const contentMapping = [
		{ flag: transactions, message: "No Transactions found", route: TransactionRoutes.Add },
		{ flag: categories, message: "No Categories found", route: CategoryRoutes.Add },
		{ flag: trips, message: "No Trips found", route: TripRoutes.Add },
		{ flag: investments, message: "No Investments found", route: InvestmentRoutes.Add },
		{ flag: sources, message: "No Sources found", route: SourceRoutes.Add }
	];

	const matchedContent = contentMapping.find((item) => item.flag) || {
		message: "No Content found",
		route: TransactionRoutes.Main
	};

	return (
		<View style={styles.view}>
			<CustomText
				text={matchedContent.message}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
			/>
			<PlusButton to={matchedContent.route} />
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		flex: FLEX_ONE,
		justifyContent: CENTER,
		backgroundColor: BACKGROUND_COLOR
	}
});

export default NoContent;
