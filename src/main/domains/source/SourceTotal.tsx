import CustomText from "../../components/CustomText";
import { CENTER, FONT_SIZE } from "../../constants/constants.config";
import useDatabase from "../../hooks/useDatabase";
import { formatMoney } from "../../util/HelperFunctions";

const SourceTotal = () => {
	const { fetchTotalForAll } = useDatabase();
	const total = fetchTotalForAll();
	return (
		<CustomText
			text={`Total Balance = ${formatMoney(total)}`}
			alignSelf={CENTER}
			fontSize={FONT_SIZE * 1.2}
			paddingVertical={FONT_SIZE}
		/>
	);
};

export default SourceTotal;
