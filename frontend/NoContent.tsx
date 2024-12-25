import { CENTER, FLEX_ONE } from "./config/constants.config";
import { BACKGROUND_COLOR, DISABLED_COLOR } from "./config/colors.config";
import { StyleSheet, View } from "react-native";
import CustomText from "./components/CustomText";
import PlusButton from "./components/PlusButton";
import Routes from "./Routes";

type INoContent = {
	transactions?: boolean;
	categories?: boolean;
	trips?: boolean;
	investments?: boolean;
	sources?: boolean;
	analysis?: boolean;
};

const NoContent = ({
	transactions,
	categories,
	trips,
	investments,
	sources,
	analysis,
}: INoContent) => {
	const contentMapping = [
		{
			flag: transactions,
			message: "No Transactions found",
			route: Routes.Transaction.Add,
		},
		{
			flag: categories,
			message: "No Categories found",
			route: Routes.Category.Add,
		},
		{
			flag: trips,
			message: "No Trips found",
			route: Routes.Trip.Add,
		},
		{
			flag: investments,
			message: "No Investments found",
			route: Routes.Investment.Add,
		},
		{
			flag: sources,
			message: "No Sources found",
			route: Routes.Source.Add,
		},
		{
			flag: analysis,
			message: "No Analysis found",
		},
	];

	const matchedContent = contentMapping.find((item) => item.flag) || {
		message: "No Content found",
		route: Routes.Transaction.Main,
	};

	return (
		<View style={styles.view}>
			<CustomText
				text={matchedContent.message}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
			/>
			{matchedContent.route && <PlusButton to={matchedContent.route} />}
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		flex: FLEX_ONE,
		justifyContent: CENTER,
		backgroundColor: BACKGROUND_COLOR,
	},
});

export default NoContent;
