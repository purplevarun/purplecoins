import { formatMoney } from "../../../../HelperFunctions";
import CustomText from "../../components/CustomText";
import { CENTER, FONT_SIZE } from "../../constants/constants.config";
import ISource from "./ISource";

const SourceTotal = ({ sources }: { sources: ISource[] }) => {
	const total = sources.reduce((sum, source) => sum + source.amount, 0);
	return (
		<CustomText
			text={`Total Net Worth = ${formatMoney(total)}`}
			alignSelf={CENTER}
			fontSize={FONT_SIZE * 1.2}
			paddingVertical={FONT_SIZE}
		/>
	);
};

export default SourceTotal;
