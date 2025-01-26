import { TouchableOpacity } from "react-native";
import { investmentRoutes } from "../../app/router/Routes";
import CustomText from "../../components/CustomText";
import {
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { formatMoney } from "../../util/HelperFunctions";
import IInvestment from "./IInvestment";

const InvestmentRenderItem = ({ item }: { item: IInvestment }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: IInvestment }) => {
	const { fetchTotalForInvestment } = useDatabase();
	const { navigate } = useScreen();
	const total = fetchTotalForInvestment(item.id);

	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				borderWidth: total == 0 ? 0 : 2,
				borderColor: total < 0 ? RED_COLOR : GREEN_COLOR,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
			onPress={() => navigate(investmentRoutes.detail, item.id)}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(Math.abs(total))} />
		</TouchableOpacity>
	);
};

export default InvestmentRenderItem;
