import { transactionRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";
import TransactionInputs from "./TransactionInputs";
import TransactionTypeSelector from "./TransactionTypeSelector";

const TransactionAdd = () => {
	const { type, setType } = useValues();
	const { navigate } = useScreen();
	const { addTransaction } = useDatabase();

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(transactionRoutes.main)}
				handleSubmit={addTransaction}
				canBeSubmitted={true}
			/>
			<TransactionTypeSelector type={type} setType={setType} />
			<TransactionInputs />
		</ScreenLayout>
	);
};

export default TransactionAdd;
