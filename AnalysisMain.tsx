import CustomText from "./CustomText";
import ScreenLayout from "./ScreenLayout";
import useTransactionService from "./TransactionService";

const AnalysisMain = () => {
	const { fetchTransactions } = useTransactionService();
	const transactions = fetchTransactions();

	return (
		<ScreenLayout>
			<CustomText text={"Not Implemented"} />
		</ScreenLayout>
	);
};

export default AnalysisMain;
