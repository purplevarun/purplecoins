import useTransactionService from "./TransactionService";
import NoContent from "./NoContent";
import ScreenLayout from "./ScreenLayout";
import CustomText from "./CustomText";

const AnalysisMain = () => {
	const { fetchTransactions } = useTransactionService();
	const transactions = fetchTransactions();

	if (transactions.length === 0) return <NoContent analysis />;

	return (
		<ScreenLayout>
			<CustomText text={"Not Implemented"} />
		</ScreenLayout>
	);
};

export default AnalysisMain;
