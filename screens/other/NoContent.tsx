import CustomText from "../../components/CustomText";
import { CENTER, FLEX_ONE } from "../../config/constants.config";
import { DISABLED_COLOR } from "../../config/colors.config";
import { View } from "react-native";

const NoContent = ({
	transactions = false,
	categories = false,
	trips = false,
	investments = false,
	sources = false,
}) => {
	const contentType = transactions
		? "Transactions"
		: categories
			? "Categories"
			: trips
				? "Trips"
				: investments
					? "Investments"
					: sources
						? "Sources"
						: "Content";

	return (
		<View style={{ flex: FLEX_ONE, justifyContent: CENTER }}>
			<CustomText
				text={`No ${contentType} added`}
				alignSelf={CENTER}
				color={DISABLED_COLOR}
			/>
		</View>
	);
};

export default NoContent;
