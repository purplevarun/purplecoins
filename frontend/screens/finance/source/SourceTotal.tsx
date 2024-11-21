import { ISource } from "../../../util/database/DatabaseSchema";
import { View } from "react-native";
import { CENTER, PADDING } from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import { formatMoney } from "../../../util/HelperFunctions";

const SourceTotal = ({ sources }: { sources: ISource[] }) => {
	const total = sources.reduce((sum, model) => sum + model.currentAmount, 0);
	return <View style={{ paddingVertical: PADDING }}>
		<CustomText
			text={`Total Net Worth = ${formatMoney(total)}`}
			alignSelf={CENTER}
		/>
	</View>;
};

export default SourceTotal;