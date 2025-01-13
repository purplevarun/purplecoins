import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import useFocus from "../../../../useFocus";
import useInvestment from "./useInvestment";

const InvestmentEdit = ({ route }: any) => {
	const {
		name,
		setName,
		currentAmount,
		setCurrentAmount,
		updateOneInvestment,
		handleClose,
		handleEditFocus,
	} = useInvestment(route.params.id);
	useFocus(handleEditFocus);
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={updateOneInvestment}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomInput
				name={"Current Amount"}
				value={currentAmount}
				setValue={setCurrentAmount}
				numeric
			/>
		</ScreenLayout>
	);
};

export default InvestmentEdit;
