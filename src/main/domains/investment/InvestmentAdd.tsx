import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
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
