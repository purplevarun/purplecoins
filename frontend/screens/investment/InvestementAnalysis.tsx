import { View } from "react-native";
import { PADDING } from "../../config/constants.config";
import CustomText from "../../components/CustomText";
import { formatMoney } from "../../HelperFunctions";
import IInvestment from "../../interfaces/IInvestment";

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
			<CustomText
				text={`Profit = ${(currentSum / investedSum - 1) * 100}%`}
			/>
		</View>
	);
};

export default InvestmentAnalysis;
