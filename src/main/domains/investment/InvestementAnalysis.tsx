import { View } from "react-native";
import { formatMoney } from "../../../../HelperFunctions";
import CustomText from "../../components/CustomText";
import { PADDING } from "../../constants/constants.config";
import IInvestment from "./IInvestment";

const InvestmentAnalysis = ({
	investments,
}: {
	investments: IInvestment[];
}) => {
	const investedSum = investments.reduce(
		(sum, model) => sum + model.investedAmount,
		0,
	);
	const currentSum = investments.reduce(
		(sum, model) => sum + model.currentAmount,
		0,
	);
	const percentage = Math.floor((currentSum / investedSum - 1) * 1000) / 10;
	const percentageText = isNaN(percentage) ? 0 : percentage;
	return (
		<View
			style={{
				paddingLeft: PADDING,
				paddingVertical: PADDING,
			}}
		>
			<CustomText
				text={`Total Investments = ${formatMoney(investedSum)}`}
			/>
			<CustomText text={`Total Returns = ${formatMoney(currentSum)}`} />
			<CustomText text={`Profit = ${percentageText}%`} />
		</View>
	);
};

export default InvestmentAnalysis;
