import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { generateUUID, logger } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import useAuthService from "../../auth/AuthService";
import useTransactionStore from "./TransactionStore";
import TransactionType from "../../../components/TransactionType";
import TransactionRoutes from "./TransactionRoutes";
import ITransaction from "../../../interfaces/ITransaction";
import ITrip from "../../../interfaces/ITrip";
import ICategory from "../../../interfaces/ICategory";
import ITransactionCategory from "../../../interfaces/ITransactionCategory";
import ITransactionTrip from "../../../interfaces/ITransactionTrip";

const useTransactionService = () => {
	const db = useSQLiteContext();
	const { getUserId } = useAuthService();
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
		setDate
	} = useTransactionStore();
	const { navigate } = useNavigation<any>();

	const createTransactionTrip = (transactionId: string, tripId: string) => {
		try {
			const query = "INSERT INTO transaction_trip (userId, transactionId, tripId) VALUES (?, ?, ?)";
			const userId = getUserId();
			db.runSync(query, [userId, transactionId, tripId]);
		} catch (e) {
			logger("ERROR: creating transaction_trip", e);
		}

	};

	const createTransactionCategory = (transactionId: string, categoryId: string) => {
		try {
			const query = "INSERT INTO transaction_category (userId, transactionId, categoryId) VALUES (?, ?, ?)";
			const userId = getUserId();
			db.runSync(query, [userId, transactionId, categoryId]);
		} catch (e) {
			logger("ERROR: creating transaction_category", e);
		}
	};

	const addNewTransaction = () => {
		try {
			const calculatedAmount = parseInt(amount);
			const id = generateUUID();
			const query = "INSERT INTO transaction_record (id,userId,sourceId,amount,reason,type,date,destinationId,investmentId) VALUES (?,?,?,?,?,?,?,?,?)";
			const sourceQuery = "UPDATE source SET currentAmount=currentAmount-? WHERE id=?";
			const destinationQuery = "UPDATE source SET currentAmount=currentAmount+? WHERE id=?";
			const investmentQuery = "UPDATE investment SET investedAmount=investedAmount+? WHERE id=?";
			db.runSync(query, [id, getUserId(), sourceId, calculatedAmount, reason, type, date.toString(), destinationId, investmentId]);
			tripIds.forEach(tripId => createTransactionTrip(id, tripId));
			categoryIds.forEach(categoryId => createTransactionCategory(id, categoryId));
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
			logger("added new transaction");
		} catch (e) {
			logger("ERROR: creating transaction", e);
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
			const query = "SELECT * FROM transaction_record WHERE userId=?";
			const transactions = db.getAllSync<ITransaction>(query, [getUserId()]);
			transactions.forEach(t => {
				const categories: ICategory[] = [];
				const trips: ITrip[] = [];
				const catIds = db.getAllSync<ITransactionCategory>("SELECT categoryId FROM transaction_category WHERE transactionId=?", [t.id]).map(c => c.categoryId);
				catIds.forEach(cId => {
					const cat = db.getFirstSync<ICategory>("SELECT * FROM category where id=?", [cId]);
					if (cat) categories.push(cat);
				});
				t.categories = categories;
				const trIds = db.getAllSync<ITransactionTrip>("SELECT tripId FROM transaction_trip WHERE transactionId=?", [t.id]).map(t => t.tripId);
				trIds.forEach(tId => {
					const tr = db.getFirstSync<ITrip>("SELECT * FROM trip where id=?", [tId]);
					if (tr) trips.push(tr);
				});
				t.trips = trips;
			});
			logger("fetched transactions", transactions);
			return transactions;
		} catch (e) {
			logger("ERROR: fetching transactions", e);
			return [];
		}
	};

	const submitEnabled = useMemo(() => {
		const amountInt = parseInt(amount);
		if (isNaN(amountInt)) return false;
		if (type === TransactionType.EXPENSE || type === TransactionType.INCOME) {
			return amountInt > 0 && reason.length > 0 && sourceId.length > 0;
		}
		if (type === TransactionType.TRANSFER) {
			return amountInt > 0 && sourceId.length > 0 && destinationId.length > 0;
		}
		if (type === TransactionType.INVESTMENT) {
			return amountInt > 0 && sourceId.length > 0 && investmentId.length > 0;
		}
		return false;
	}, [amount, reason, sourceId, destinationId, investmentId]);

	return { addNewTransaction, fetchTransactions, submitEnabled };
};

export default useTransactionService;