import CustomInput from "../../../../CustomInput";
import Header from "../../../../Header";
import ScreenLayout from "../../../../ScreenLayout";
import useInvestment from "./useInvestment";

const InvestmentAdd = () => {
	const {
		name,
		setName,
		investedAmount,
		setInvestedAmount,
		addInvestment,
		handleClose,
	} = useInvestment();
	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleSubmit={addInvestment}
				canBeSubmitted={name !== ""}
			/>
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomInput
				name={"Invested Amount"}
				value={investedAmount}
				setValue={setInvestedAmount}
				numeric
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
