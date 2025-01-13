import Header from "./Header";
import NoContent from "./NoContent";
import ScreenLayout from "./ScreenLayout";
import TransactionSectionList from "./TransactionSectionList";
import useFocus from "./useFocus";
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
