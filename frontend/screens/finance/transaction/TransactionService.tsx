import { generateUUID, logger } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import useAuthService from "../../auth/AuthService";
import useTransactionStore from "./TransactionStore";
import TransactionType from "../../../types/TransactionType";
import { ICategory, ITransactionData, ITrip } from "../../../util/database/DatabaseSchema";
import TransactionRoutes from "./TransactionRoutes";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";

const useTransactionService = () => {
	const db = useSQLiteContext();
	const { getUserId } = useAuthService();
	const {
		transactionTripIds,
		transactionCategoryIds,
		transactionAmount,
		transactionReason,
		transactionType,
		transactionDate,
		transactionSourceId,
		transactionDestinationId,
		transactionInvestmentId,
		setTransactionAmount,
		setTransactionReason,
		setTransactionSourceId,
		setTransactionDestinationId,
		setTransactionInvestmentId,
		setTransactionCategoryIds,
		setTransactionTripIds,
		setTransactionDate
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
			const calculatedAmount = parseInt(transactionAmount);
			const id = generateUUID();
			const query = "INSERT INTO transaction_record (id,userId,sourceId,amount,reason,type,date,destinationId,investmentId) VALUES (?,?,?,?,?,?,?,?,?)";
			const sourceQuery = "UPDATE source SET currentAmount=currentAmount-? WHERE id=?";
			const destinationQuery = "UPDATE source SET currentAmount=currentAmount+? WHERE id=?";
			const investmentQuery = "UPDATE investment SET investedAmount=investedAmount+? WHERE id=?";
			db.runSync(query, [id, getUserId(), transactionSourceId, calculatedAmount, transactionReason, transactionType, transactionDate.toString(), transactionDestinationId, transactionInvestmentId]);
			transactionTripIds.forEach(tripId => createTransactionTrip(id, tripId));
			transactionCategoryIds.forEach(categoryId => createTransactionCategory(id, categoryId));
			if (transactionType === TransactionType.EXPENSE) {
				db.runSync(sourceQuery, [calculatedAmount, transactionSourceId]);
			} else if (transactionType === TransactionType.INCOME) {
				db.runSync(destinationQuery, [calculatedAmount, transactionSourceId]);
			} else if (transactionType === TransactionType.INVESTMENT) {
				db.runSync(sourceQuery, [calculatedAmount, transactionSourceId]);
				db.runSync(investmentQuery, [calculatedAmount, transactionSourceId]);
			} else if (transactionType === TransactionType.TRANSFER) {
				db.runSync(sourceQuery, [calculatedAmount, transactionSourceId]);
				db.runSync(destinationQuery, [calculatedAmount, transactionDestinationId]);
			}
			logger("added new transaction");
		} catch (e) {
			logger("ERROR: creating transaction", e);
		}
		setTransactionAmount("");
		setTransactionReason("");
		setTransactionSourceId("");
		setTransactionDestinationId("");
		setTransactionInvestmentId("");
		setTransactionCategoryIds([]);
		setTransactionTripIds([]);
		setTransactionDate(new Date());
		navigate(TransactionRoutes.Main);
	};

	const fetchTransactions = () => {
		try {
			const query = "SELECT * from transaction_record WHERE userId=?";
			const transactions = db.getAllSync<ITransactionData>(query, [getUserId()]);
			transactions.forEach(t => {
				const categories: ICategory[] = [];
				const trips: ITrip[] = [];
				const catIds = db.getAllSync<any>("SELECT categoryId FROM transaction_category where transactionId=?", [t.id]).map(c => c.categoryId);
				catIds.forEach(cId => {
					const cat = db.getFirstSync<ICategory>("SELECT * FROM category where id=?", [cId]);
					if (cat) categories.push(cat);
				});
				t.categories = categories;
				const trIds = db.getAllSync<any>("SELECT tripId FROM transaction_trip where transactionId=?", [t.id]).map(t => t.tripId);
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
		const amountInt = parseInt(transactionAmount);
		if (isNaN(amountInt)) return false;
		if (transactionType === TransactionType.EXPENSE || transactionType === TransactionType.INCOME) {
			return amountInt > 0 && transactionReason.length > 0 && transactionSourceId.length > 0;
		}
		if (transactionType === TransactionType.TRANSFER) {
			return amountInt > 0 && transactionSourceId.length > 0 && transactionDestinationId.length > 0;
		}
		if (transactionType === TransactionType.INVESTMENT) {
			return amountInt > 0 && transactionSourceId.length > 0 && transactionInvestmentId.length > 0;
		}
		return false;
	}, [transactionAmount, transactionReason, transactionSourceId, transactionDestinationId, transactionInvestmentId]);

	return { addNewTransaction, fetchTransactions, submitEnabled };
};

export default useTransactionService;