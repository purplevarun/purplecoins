import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Header from "./Header";
import useInvestmentService from "./InvestmentService";
import useInvestmentStore from "./InvestmentStore";
import ScreenLayout from "./ScreenLayout";
import { MINIMUM_LENGTH } from "./constants.config";
import useNavigate from "./useNavigate";

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
	const { navigateToInvestmentMain } = useNavigate();
	return (
		<ScreenLayout>
			<Header
				title={"Add Investment"}
				handlePlus={navigateToInvestmentMain}
			/>
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
