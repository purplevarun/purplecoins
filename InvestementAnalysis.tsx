import { View } from "react-native";
import CustomText from "./CustomText";
import { formatMoney } from "./HelperFunctions";
import IInvestment from "./IInvestment";
import { PADDING } from "./constants.config";

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
			<CustomText text={`Profit = ${percentage}%`} />
		</View>
	);
};

export default InvestmentAnalysis;
