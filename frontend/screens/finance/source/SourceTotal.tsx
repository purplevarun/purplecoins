import { View } from "react-native";
import { CENTER, PADDING } from "../../../config/constants.config";
import { formatMoney } from "../../../util/helpers/HelperFunctions";
import CustomText from "../../../components/CustomText";
import ISource from "../../../interfaces/ISource";

const SourceTotal = ({ sources }: { sources: ISource[] }) => {
	const total = sources.reduce((sum, model) => sum + model.currentAmount, 0);
	return (
		<View style={{ paddingVertical: PADDING }}>
			<CustomText
				text={`Total Net Worth = ${formatMoney(total)}`}
				alignSelf={CENTER}
			/>
		</View>
	);
};

export default SourceTotal;
