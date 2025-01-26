import { transactionRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import TransactionInputs from "./TransactionInputs";

const TransactionEdit = ({ route }: { route: any }) => {
	const { navigate } = useScreen();
	const { updateTransaction, transactionEditScreenFocus } = useDatabase();

	useFocus(() => transactionEditScreenFocus(route.params.id));

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(transactionRoutes.main)}
				handleSubmit={() => updateTransaction(route.params.id)}
				canBeSubmitted={true}
			/>
			<TransactionInputs />
		</ScreenLayout>
	);
};

export default TransactionEdit;
