import CustomButton from "../../../CustomButton";
import CustomInput from "../../../CustomInput";
import Header from "../../../Header";
import ScreenLayout from "../../../ScreenLayout";
import Vertical from "../../../Vertical";
import { MARGIN, QUARTER } from "../../../constants.config";
import useFocus from "../../../useFocus";
import useInvestment from "./useInvestment";

const InvestmentEdit = ({ route }: any) => {
	const {
		name,
		setName,
		currentAmount,
		setCurrentAmount,
		updateOneInvestment,
		disabled,
		handleClose,
		handleEditFocus,
	} = useInvestment(route.params.id);
	useFocus(handleEditFocus);
	return (
		<ScreenLayout>
			<Header handleClose={handleClose} />
			<Vertical size={MARGIN} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<Vertical size={QUARTER} />
			<CustomInput
				name={"Current Amount"}
				value={currentAmount}
				setValue={setCurrentAmount}
				numeric
			/>
			<CustomButton disabled={disabled} onPress={updateOneInvestment} />
		</ScreenLayout>
	);
};

export default InvestmentEdit;
