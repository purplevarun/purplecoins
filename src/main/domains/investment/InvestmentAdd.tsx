import { investmentRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const InvestmentAdd = () => {
	const { investmentName, setInvestmentName } = useValues();
	const { navigate } = useScreen();
	const { addInvestment } = useDatabase();

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(investmentRoutes.main)}
				handleSubmit={addInvestment}
				canBeSubmitted={investmentName !== ""}
			/>
			<CustomInput
				name={"Investment Name"}
				value={investmentName}
				setValue={setInvestmentName}
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
