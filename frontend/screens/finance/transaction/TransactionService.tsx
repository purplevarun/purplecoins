import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import {
	formatDate,
	generateUUID,
	objectify,
} from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import useAuthService from "../../auth/AuthService";
import useTransactionStore from "./TransactionStore";
import TransactionType from "../../../components/TransactionType";
import TransactionRoutes from "./TransactionRoutes";
import ITransaction, {
	IGroupedTransactions,
} from "../../../interfaces/ITransaction";

const FETCH_TRANSACTION = `
	SELECT 
		t.id,
		t.amount,
		t.reason,
		t.type,
		t.date,
		s.name AS source,
		d.name AS destination,
		i.name AS investment,
		u.name AS user,
			CASE 
			WHEN COUNT(c.id) > 0
			THEN
				JSON_GROUP_ARRAY(
					DISTINCT JSON_OBJECT(
						'name', c.name,
						'id', c.id
					)
				) 
			ELSE NULL 
			END
		AS categories,
			CASE 
			WHEN COUNT(trip.id) > 0
			THEN
				JSON_GROUP_ARRAY(
					DISTINCT JSON_OBJECT(
						'name', trip.name,
						'id', trip.id,
						'startDate', trip.startDate,
						'endDate', trip.endDate
					)
				) 
			ELSE NULL 
			END
		AS trips
	FROM transaction_record t
	LEFT JOIN transaction_category tc ON t.id = tc.transactionId
	LEFT JOIN category c ON tc.categoryId = c.id
	LEFT JOIN transaction_trip tt ON t.id = tt.transactionId
	LEFT JOIN trip ON tt.tripId = trip.id
	LEFT JOIN source s ON t.sourceId = s.id
	LEFT JOIN source d ON t.destinationId = d.id
	LEFT JOIN investment i ON t.investmentId = i.id
	LEFT JOIN user u ON t.userId = u.id
	WHERE t.id = ?;
`;

const FETCH_TRANSACTIONS = `
	SELECT 
		t.id,
		t.amount,
		t.reason,
		t.type,
		t.date,
		s.name AS source,
		d.name AS destination,
		i.name AS investment,
		u.name AS user,
			CASE 
			WHEN COUNT(c.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', c.name)) 
			ELSE NULL 
			END
		AS categories,
			CASE 
			WHEN COUNT(trip.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', trip.name)) 
			ELSE NULL 
			END
		AS trips
	FROM transaction_record t
	LEFT JOIN transaction_category tc ON t.id = tc.transactionId
	LEFT JOIN category c ON tc.categoryId = c.id
	LEFT JOIN transaction_trip tt ON t.id = tt.transactionId
	LEFT JOIN trip ON tt.tripId = trip.id
	LEFT JOIN source s ON t.sourceId = s.id
	LEFT JOIN source d ON t.destinationId = d.id
	LEFT JOIN investment i ON t.investmentId = i.id
	LEFT JOIN user u ON t.userId = u.id
	WHERE t.userId = ?
	GROUP BY t.id
	ORDER BY t.date DESC;
`;

const useTransactionService = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();
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
			const query =
				"INSERT INTO transaction_trip (userId, transactionId, tripId) VALUES (?, ?, ?)";
			db.runSync(query, [userId, transactionId, tripId]);
		} catch (e) {
			console.log("ERROR: creating transaction_trip", e);
		}
	};

	const createTransactionCategory = (
		transactionId: string,
		categoryId: string,
	) => {
		try {
			const query =
				"INSERT INTO transaction_category (userId, transactionId, categoryId) VALUES (?, ?, ?)";
			db.runSync(query, [userId, transactionId, categoryId]);
		} catch (e) {
			console.log("ERROR: creating transaction_category", e);
		}
	};

	const addNewTransaction = () => {
		try {
			const calculatedAmount = parseInt(amount);
			const id = generateUUID();
			const query =
				"INSERT INTO transaction_record (id,userId,sourceId,amount,reason,type,date,destinationId,investmentId) VALUES (?,?,?,?,?,?,?,?,?)";
			const sourceQuery =
				"UPDATE source SET currentAmount=currentAmount-? WHERE id=?";
			const destinationQuery =
				"UPDATE source SET currentAmount=currentAmount+? WHERE id=?";
			const investmentQuery =
				"UPDATE investment SET investedAmount=investedAmount+? WHERE id=?";
			db.runSync(query, [
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
				db.runSync(sourceQuery, [calculatedAmount, sourceId]);
			} else if (type === TransactionType.INCOME) {
				db.runSync(destinationQuery, [calculatedAmount, sourceId]);
			} else if (type === TransactionType.INVESTMENT) {
				db.runSync(sourceQuery, [calculatedAmount, sourceId]);
				db.runSync(investmentQuery, [calculatedAmount, sourceId]);
			} else if (type === TransactionType.TRANSFER) {
				db.runSync(sourceQuery, [calculatedAmount, sourceId]);
				db.runSync(destinationQuery, [calculatedAmount, destinationId]);
			}
			console.log("added new transaction");
		} catch (e) {
			console.log("ERROR: creating transaction", e);
		}
		setAmount("");
		setReason("");
		setSourceId("");
		setDestinationId("");
		setInvestmentId("");
		setCategoryIds([]);
		setTripIds([]);
		setDate(new Date());
		navigate(TransactionRoutes.Main);
	};

	const fetchTransactions = () => {
		try {
			const transactions = db.getAllSync<ITransaction>(
				FETCH_TRANSACTIONS,
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
		navigate(TransactionRoutes.Detail);
	};

	const handleEdit = () => {};

	const handleDelete = () => {};

	const fetchTransaction = () => {
		const transaction = db.getFirstSync<ITransaction>(FETCH_TRANSACTION, [
			currentTransactionId,
		]) as ITransaction;
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
