import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import useInvestmentService from "./InvestmentService";
import useInvestmentStore from "./InvestmentStore";
import ScreenLayout from "./ScreenLayout";
import { MINIMUM_LENGTH } from "./constants.config";

const InvestmentAdd = () => {
	const {
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		currentAmount,
		setCurrentAmount,
	} = useInvestmentStore();
	const { addNewInvestment } = useInvestmentService();

	return (
		<ScreenLayout>
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomInput
				name={"Invested Amount"}
				value={investedAmount}
				setValue={setInvestedAmount}
				numeric
			/>
			<CustomInput
				name={"Current Amount"}
				value={currentAmount}
				setValue={setCurrentAmount}
				numeric
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={addNewInvestment}
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
