import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
import TransactionSectionList from "./TransactionSectionList";
import useTransaction from "./useTransaction";

const TransactionMain = () => {
	const { handlePlus, handleMainFocus, groupedTransactions } =
		useTransaction();
	useFocus(handleMainFocus);

	if (groupedTransactions.length === 0)
		return <NoContent handlePlus={handlePlus} />;

	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<TransactionSectionList transactions={groupedTransactions} />
		</ScreenLayout>
	);
};

export default TransactionMain;
