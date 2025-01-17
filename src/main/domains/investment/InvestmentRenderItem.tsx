import { TouchableOpacity } from "react-native";
import CustomText from "../../components/CustomText";
import { SECONDARY_COLOR } from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import IInvestment from "./IInvestment";
import useInvestment from "./useInvestment";

const InvestmentRenderItem = ({ item }: { item: IInvestment }) => {
	const { handleDetail } = useInvestment(item.id);
	const percentage =
		Math.floor((item.currentAmount / item.investedAmount - 1) * 1000) / 10;
	const percentageText = isNaN(percentage) ? 0 : percentage;
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
			onPress={handleDetail}
		>
			<CustomText text={item.name} alignSelf={CENTER} />
			<CustomText text={percentageText + "%"} />
		</TouchableOpacity>
	);
};

export default InvestmentRenderItem;
