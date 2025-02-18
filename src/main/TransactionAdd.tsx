import { transactionRoutes } from "./Routes";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import TransactionRelationType from "./TransactionRelationType";
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";
import useValues from "./useValues";
import { convertStringToDate } from "./HelperFunctions";
import TransactionInputs from "./TransactionInputs";
import TransactionTypeSelector from "./TransactionTypeSelector";

const TransactionAdd = () => {
	const {
		type,
		setType,
		amount,
		reason,
		action,
		date,
		trips,
		categories,
		source,
		investment,
		destination,
		clear,
	} = useValues();
	const navigate = useScreen();
	const { addTransaction, addTransactionRelation } = useDatabase();

	return (
		<ScreenLayout>
			<Header
				handleClose={() => {
					navigate(transactionRoutes.main);
					clear();
				}}
				handleSubmit={() => {
					const transactionId = addTransaction(
						parseInt(amount),
						reason,
						action,
						type,
						convertStringToDate(date),
					);
					trips.forEach((trip) =>
						addTransactionRelation(
							transactionId,
							trip,
							TransactionRelationType.TRIP,
						),
					);
					categories.forEach((category) =>
						addTransactionRelation(
							transactionId,
							category,
							TransactionRelationType.CATEGORY,
						),
					);
					addTransactionRelation(
						transactionId,
						source,
						TransactionRelationType.SOURCE,
					);
					if (investment)
						addTransactionRelation(
							transactionId,
							investment,
							TransactionRelationType.INVESTMENT,
						);
					if (destination)
						addTransactionRelation(
							transactionId,
							destination,
							TransactionRelationType.DESTINATION,
						);
					clear();
					navigate(transactionRoutes.main);
				}}
				canBeSubmitted={true}
			/>
			<TransactionTypeSelector type={type} setType={setType} />
			<TransactionInputs />
		</ScreenLayout>
	);
};

export default TransactionAdd;
