import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import { formatMoney } from "./HelperFunctions";
import IInvestment from "./IInvestment";
import { SECONDARY_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const InvestmentRenderItem = ({ item }: { item: IInvestment }) => {
	const { name, investedAmount, currentAmount } = item;
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
		>
			<CustomText text={name} alignSelf={CENTER} />
			<View>
				<CustomText text={formatMoney(investedAmount)} />
				<CustomText text={formatMoney(currentAmount)} />
			</View>
		</TouchableOpacity>
	);
};

export default InvestmentRenderItem;
