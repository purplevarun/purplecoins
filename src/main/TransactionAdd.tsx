import Header from "./Header";
import { convertStringToDate } from "./HelperFunctions";
import { transactionRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import TransactionInputs from "./TransactionInputs";
import TransactionRelationType from "./TransactionRelationType";
import TransactionTypeSelector from "./TransactionTypeSelector";
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";
import useValues from "./useValues";

const TransactionAdd = () => {
	const values = useValues();
	const navigate = useScreen();
	const { addTransaction, addTransactionRelation } = useDatabase();
	const canBeSubmitted = () => {
		if (values.amount === "" || parseInt(values.amount) <= 0) return false;
		if (values.reason === "") return false;
		if (values.date.length !== 10) return false;
		if (values.date.split("/").length !== 3) return false;
		const [d, m, y] = values.date.split("/");
		if (parseInt(d) < 1 || parseInt(d) > 31) return false;
		if (parseInt(m) < 1 || parseInt(m) > 12) return false;
		if (y.length !== 4) return false;
		return values.source !== "";
	};

	return (
		<ScreenLayout>
			<Header
				handleClose={() => {
					navigate(transactionRoutes.main);
					values.clear();
				}}
				handleSubmit={() => {
					const transactionId = addTransaction(
						parseInt(values.amount),
						values.reason,
						values.action,
						values.type,
						convertStringToDate(values.date),
					);
					values.trips.forEach((trip) =>
						addTransactionRelation(
							transactionId,
							trip,
							TransactionRelationType.TRIP,
						),
					);
					values.categories.forEach((category) =>
						addTransactionRelation(
							transactionId,
							category,
							TransactionRelationType.CATEGORY,
						),
					);
					addTransactionRelation(
						transactionId,
						values.source,
						TransactionRelationType.SOURCE,
					);
					if (values.investment)
						addTransactionRelation(
							transactionId,
							values.investment,
							TransactionRelationType.INVESTMENT,
						);
					if (values.destination)
						addTransactionRelation(
							transactionId,
							values.destination,
							TransactionRelationType.DESTINATION,
						);
					values.clear();
					navigate(transactionRoutes.main);
				}}
				canBeSubmitted={canBeSubmitted()}
			/>
			<TransactionTypeSelector
				type={values.type}
				setType={values.setType}
			/>
			<TransactionInputs />
		</ScreenLayout>
	);
};

export default TransactionAdd;
