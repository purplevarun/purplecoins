import useTransactionService from "../transaction/TransactionService";
import NoContent from "../../NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import CustomText from "../../components/CustomText";

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
