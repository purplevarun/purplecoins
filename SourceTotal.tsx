import { View } from "react-native";
import { CENTER, PADDING } from "./constants.config";
import { formatMoney } from "./HelperFunctions";
import CustomText from "./CustomText";
import ISource from "./ISource";

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
