import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { formatDate, generateUUID, objectify } from "../../HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import {
	create_transaction_category,
	create_transaction_trip,
	fetch_all_transactions,
	fetch_single_transaction,
	insert_transaction,
	select_all_users,
	update_destination_amount,
	update_investment_amount,
	update_source_amount,
} from "../../config/queries.config";
import useTransactionStore from "./TransactionStore";
import TransactionType from "../../components/TransactionType";
import ITransaction from "../../interfaces/ITransaction";
import IUser from "../../interfaces/IUser";
import Routes from "../../Routes";
import IGroupedTransactions from "../../interfaces/IGroupedTransactions";

const useTransactionService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
	const {
		tripIds,
		categoryIds,
		amount,
		reason,
		type,
		date,
		sourceId,
		destinationId,
		investmentId,
		setAmount,
		setReason,
		setSourceId,
		setDestinationId,
		setInvestmentId,
		setCategoryIds,
		setTripIds,
		setDate,
		currentTransactionId,
		setCurrentTransactionId,
	} = useTransactionStore();
	const { navigate } = useNavigation<any>();

	const createTransactionTrip = (transactionId: string, tripId: string) => {
		try {
			db.runSync(create_transaction_trip, [userId, transactionId, tripId]);
		} catch (e) {
			console.log("ERROR: creating transaction_trip", e);
		}
	};

	const createTransactionCategory = (
		transactionId: string,
		categoryId: string,
	) => {
		try {
			db.runSync(create_transaction_category, [userId, transactionId, categoryId]);
		} catch (e) {
			console.log("ERROR: creating transaction_category", e);
		}
	};

	const clearStore = () => {
		setAmount("");
		setReason("");
		setSourceId("");
		setDestinationId("");
		setInvestmentId("");
		setCategoryIds([]);
		setTripIds([]);
		setDate(new Date());
	};

	const addNewTransaction = () => {
		try {
			const calculatedAmount = parseInt(amount);
			const id = generateUUID();
			db.runSync(insert_transaction, [
				id,
				userId,
				sourceId,
				calculatedAmount,
				reason,
				type,
				date.toString(),
				destinationId,
				investmentId,
			]);
			tripIds.forEach((tripId) => createTransactionTrip(id, tripId));
			categoryIds.forEach((categoryId) =>
				createTransactionCategory(id, categoryId),
			);
			if (type === TransactionType.EXPENSE) {
				db.runSync(update_source_amount, [calculatedAmount, sourceId]);
			} else if (type === TransactionType.INCOME) {
				db.runSync(update_destination_amount, [calculatedAmount, sourceId]);
			} else if (type === TransactionType.INVESTMENT) {
				db.runSync(update_source_amount, [calculatedAmount, sourceId]);
				db.runSync(update_investment_amount, [calculatedAmount, sourceId]);
			} else if (type === TransactionType.TRANSFER) {
				db.runSync(update_source_amount, [calculatedAmount, sourceId]);
				db.runSync(update_destination_amount, [calculatedAmount, destinationId]);
			}
			console.log("added new transaction");
		} catch (e) {
			console.log("ERROR: creating transaction", e);
		}
		clearStore();
		navigate(Routes.Transaction.Main);
	};

	const fetchTransactions = () => {
		try {
			const transactions = db.getAllSync<ITransaction>(
				fetch_all_transactions,
				[userId],
			);
			console.log("FETCHED TRANSACTIONS");
			return transactions;
		} catch {
			console.error("ERROR FETCHING TRANSACTIONS");
			return [];
		}
	};

	const submitEnabled = useMemo(() => {
		const amountInt = parseInt(amount);
		if (isNaN(amountInt)) return false;
		if (
			type === TransactionType.EXPENSE ||
			type === TransactionType.INCOME
		) {
			return reason.length > 0 && sourceId.length > 0;
		}
		if (type === TransactionType.TRANSFER) {
			return sourceId.length > 0 && destinationId.length > 0;
		}
		if (type === TransactionType.INVESTMENT) {
			return sourceId.length > 0 && investmentId.length > 0;
		}
		return false;
	}, [amount, reason, sourceId, destinationId, investmentId]);

	const selectTransaction = (id: string) => {
		setCurrentTransactionId(id);
		navigate(Routes.Transaction.Detail);
	};

	const handleEdit = () => {
	};

	const handleDelete = () => {
	};

	const fetchTransaction = () => {
		const transaction = db.getFirstSync<ITransaction>(
			fetch_single_transaction,
			[currentTransactionId],
		) as ITransaction;
		console.log("FETCHED CURRENT TRANSACTION", objectify(transaction));
		return transaction;
	};

	const fetchGroupedTransactions = () => {
		const transactions = fetchTransactions();
		const groupedTransactions: IGroupedTransactions = Object.entries(
			transactions.reduce<Record<string, ITransaction[]>>(
				(acc, transaction) => {
					const normalizedDate = new Date(transaction.date);
					normalizedDate.setHours(0, 0, 0, 0);
					const date = normalizedDate.getTime();
					(acc[date] ||= []).push(transaction);
					return acc;
				},
				{},
			),
		)
			.map(([title, data]) => ({ title, data }))
			.sort((a, b) => parseInt(b.title) - parseInt(a.title));
		groupedTransactions.forEach(
			(group) =>
				(group.title = formatDate(
					new Date(parseInt(group.title)),
					true,
				)),
		);
		return groupedTransactions;
	};

	return {
		submitEnabled,
		addNewTransaction,
		fetchTransactions,
		selectTransaction,
		handleEdit,
		handleDelete,
		fetchTransaction,
		fetchGroupedTransactions,
	};
};

export default useTransactionService;
