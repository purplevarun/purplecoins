import { investmentRoutes } from "../../app/router/Routes";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";

const InvestmentEdit = ({ route }: { route: any }) => {
	const id = route.params.id;
	const { investmentName, setInvestmentName } = useValues();
	const { navigate } = useScreen();
	const { fetchInvestment, updateInvestment } = useDatabase();

	useFocus(() => {
		const investment = fetchInvestment(id);
		setInvestmentName(investment.name);
	});

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(investmentRoutes.main)}
				handleSubmit={() => updateInvestment(id)}
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

export default InvestmentEdit;
