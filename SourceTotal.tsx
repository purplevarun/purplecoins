import { View } from "react-native";
import CustomText from "./CustomText";
import { formatMoney } from "./HelperFunctions";
import ISource from "./ISource";
import { CENTER, PADDING } from "./constants.config";

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
