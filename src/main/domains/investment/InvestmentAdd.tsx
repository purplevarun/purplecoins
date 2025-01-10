import CustomButton from "../../../../CustomButton";
import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import Vertical from "../../../../Vertical";
import { MARGIN, QUARTER } from "../../../../constants.config";
import useInvestment from "./useInvestment";

const InvestmentAdd = () => {
	const {
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		addInvestment,
		disabled,
		handleClose,
	} = useInvestment();
	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<Vertical size={QUARTER} />
			<CustomInput
				name={"Invested Amount"}
				value={investedAmount}
				setValue={setInvestedAmount}
				numeric
			/>
			<CustomButton disabled={disabled} onPress={addInvestment} />
		</ScreenLayout>
	);
};

export default InvestmentAdd;
