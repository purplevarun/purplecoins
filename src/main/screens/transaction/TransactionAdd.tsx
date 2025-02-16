import { transactionRoutes } from "../../app/router/Routes";
import Header from "../../components/header/Header";
import ScreenLayout from "../../components/layout/ScreenLayout";
import TransactionRelationType from "../../constants/enums/TransactionRelationType";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import useValues from "../../hooks/useValues";
import { convertStringToDate } from "../../util/HelperFunctions";
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
