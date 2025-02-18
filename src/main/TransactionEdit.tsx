import Header from "./Header";
import { convertDateToString, convertStringToDate } from "./HelperFunctions";
import { transactionRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import TransactionInputs from "./TransactionInputs";
import TransactionRelationType from "./TransactionRelationType";
import useDatabase from "./useDatabase";
import useFocus from "./useFocus";
import useScreen from "./useScreen";
import useValues from "./useValues";

const TransactionEdit = ({ route }: any) => {
	const id = route.params.id;
	const navigate = useScreen();
	const {
		updateTransaction,
		deleteRelationsForTransaction,
		addTransactionRelation,
		fetchTransaction,
		fetchRelationsForTransaction,
	} = useDatabase();
	const {
		amount,
		reason,
		action,
		type,
		date,
		trips,
		categories,
		source,
		destination,
		investment,
		clear,
		setAction,
		setAmount,
		setType,
		setReason,
		setDate,
		setTrips,
		setDestination,
		setCategories,
		setSource,
		setInvestment,
	} = useValues();
	useFocus(() => {
		const existingTransaction = fetchTransaction(id);
		const existingRelations = fetchRelationsForTransaction(id);
		setType(existingTransaction.type);
		setAmount(String(existingTransaction.amount));
		setReason(existingTransaction.reason);
		setAction(existingTransaction.action);
		setDate(convertDateToString(existingTransaction.date));
		setSource(existingRelations.TRANSACTION_SOURCE[0].id);
		existingRelations.TRANSACTION_DESTINATION &&
			setDestination(existingRelations.TRANSACTION_DESTINATION[0].id);
		existingRelations.TRANSACTION_TRIP &&
			setTrips(existingRelations.TRANSACTION_TRIP.map((t) => t.id));
		existingRelations.TRANSACTION_CATEGORY &&
			setCategories(
				existingRelations.TRANSACTION_CATEGORY.map((t) => t.id),
			);
		existingRelations.TRANSACTION_INVESTMENT &&
			setInvestment(existingRelations.TRANSACTION_INVESTMENT[0].id);
	});

	return (
		<ScreenLayout>
			<Header
				handleClose={() => {
					navigate(transactionRoutes.main);
					clear();
				}}
				handleSubmit={() => {
					deleteRelationsForTransaction(id);
					updateTransaction(
						id,
						parseInt(amount),
						reason,
						action,
						type,
						convertStringToDate(date),
					);
					trips.forEach((trip) =>
						addTransactionRelation(
							id,
							trip,
							TransactionRelationType.TRIP,
						),
					);
					categories.forEach((category) =>
						addTransactionRelation(
							id,
							category,
							TransactionRelationType.CATEGORY,
						),
					);
					addTransactionRelation(
						id,
						source,
						TransactionRelationType.SOURCE,
					);
					if (investment)
						addTransactionRelation(
							id,
							investment,
							TransactionRelationType.INVESTMENT,
						);
					if (destination)
						addTransactionRelation(
							id,
							destination,
							TransactionRelationType.DESTINATION,
						);
					clear();
					navigate(transactionRoutes.main);
				}}
				canBeSubmitted={true}
			/>
			<TransactionInputs />
		</ScreenLayout>
	);
};

export default TransactionEdit;
