import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import {
	categoryRoutes,
	investmentRoutes,
	sourceRoutes,
	transactionRoutes,
	tripRoutes,
} from "../app/router/Routes";
import Action from "../constants/enums/Action";
import Type from "../constants/enums/Type";
import queries from "../constants/queries/queries";
import ICategory from "../domains/category/ICategory";
import IInvestment from "../domains/investment/IInvestment";
import ISource from "../domains/source/ISource";
import ITransaction from "../domains/transaction/ITransaction";
import ITrip from "../domains/trip/ITrip";
import ITotal from "../types/ITotal";
import {
	convertDateToString,
	convertStringToDate,
} from "../util/HelperFunctions";
import useScreen from "./useScreen";
import useValues from "./useValues";

const useDatabase = () => {
	const db = useSQLiteContext();
	const { navigate } = useScreen();
	const values = useValues();
	const fetchAllSources = () => {
		return db.getAllSync<ISource>(queries.fetch_all_sources);
	};

	const fetchSource = (sourceId: string) => {
		return db.getFirstSync<ISource>(queries.fetch_source, [
			sourceId,
		]) as ISource;
	};

	const addSource = () => {
		db.runSync(queries.add_source, [randomUUID(), values.sourceName]);
		values.setSourceName("");
		navigate(sourceRoutes.main);
	};

	const updateSource = (sourceId: string) => {
		db.runSync(queries.update_source, [values.sourceName, sourceId]);
		values.setSourceName("");
		navigate(sourceRoutes.main);
	};

	const deleteSource = (sourceId: string) => {
		db.runSync(queries.delete_source, [sourceId]);
		navigate(sourceRoutes.main);
	};

	const fetchAllTrips = () => {
		return db.getAllSync<ITrip>(queries.fetch_all_trips);
	};

	const fetchTrip = (tripId: string) => {
		return db.getFirstSync<ITrip>(queries.fetch_trip, [tripId]) as ITrip;
	};

	const addTrip = () => {
		db.runSync(queries.add_trip, [randomUUID(), values.tripName]);
		values.setTripName("");
		navigate(tripRoutes.main);
	};

	const updateTrip = (tripId: string) => {
		db.runSync(queries.update_trip, [values.tripName, tripId]);
		values.setTripName("");
		navigate(tripRoutes.main);
	};

	const deleteTrip = (tripId: string) => {
		db.runSync(queries.delete_trip, [tripId]);
		navigate(tripRoutes.main);
	};

	const fetchAllCategories = () => {
		return db.getAllSync<ICategory>(queries.fetch_all_categories);
	};

	const fetchCategory = (categoryId: string) => {
		return db.getFirstSync<ICategory>(
			queries.fetch_category,
			categoryId,
		) as ICategory;
	};

	const addCategory = () => {
		db.runSync(queries.add_category, [randomUUID(), values.categoryName]);
		values.setCategoryName("");
		navigate(categoryRoutes.main);
	};

	const updateCategory = (categoryId: string) => {
		db.runSync(queries.update_category, [values.categoryName, categoryId]);
		values.setCategoryName("");
		navigate(categoryRoutes.main);
	};

	const deleteCategory = (categoryId: string) => {
		db.runSync(queries.delete_category, [categoryId]);
		navigate(categoryRoutes.main);
	};

	const fetchAllInvestments = () => {
		return db.getAllSync<IInvestment>(queries.fetch_all_investments);
	};

	const fetchInvestment = (investmentId: string) => {
		return db.getFirstSync<IInvestment>(queries.fetch_investment, [
			investmentId,
		]) as IInvestment;
	};

	const addInvestment = () => {
		db.runSync(queries.add_investment, [
			randomUUID(),
			values.investmentName,
		]);
		values.setInvestmentName("");
		navigate(investmentRoutes.main);
	};

	const updateInvestment = (investmentId: string) => {
		db.runSync(queries.update_investment, [
			values.investmentName,
			investmentId,
		]);
		values.setInvestmentName("");
		navigate(investmentRoutes.main);
	};

	const deleteInvestment = (investmentId: string) => {
		db.runSync(queries.delete_investment, [investmentId]);
		navigate(investmentRoutes.main);
	};

	const fetchAllTransactions = () => {
		return db.getAllSync<ITransaction>(queries.fetch_all_transactions);
	};

	const fetchTransaction = (transactionId: string) => {
		return db.getFirstSync<ITransaction>(queries.fetch_transaction, [
			transactionId,
		]) as ITransaction;
	};

	const addTransactionTrip = (transactionId: string, tripId: string) => {
		db.runSync(queries.add_transaction_trip, [transactionId, tripId]);
	};

	const addTransactionCategory = (
		transactionId: string,
		categoryId: string,
	) => {
		db.runSync(queries.add_transaction_category, [
			transactionId,
			categoryId,
		]);
	};

	const addTransaction = () => {
		const newTransactionId = randomUUID();
		const convertedDate = convertStringToDate(values.date);
		if (values.type === Type.GENERAL) {
			db.runSync(queries.add_transaction, [
				newTransactionId,
				parseInt(values.amount),
				values.reason,
				Type.GENERAL,
				values.action,
				convertedDate,
				values.source,
				null,
				null,
			]);
			values.trips.forEach((tripId) =>
				addTransactionTrip(newTransactionId, tripId),
			);
			values.categories.forEach((categoryId) =>
				addTransactionCategory(newTransactionId, categoryId),
			);
		} else if (values.type === Type.TRANSFER) {
			db.runSync(queries.add_transaction, [
				newTransactionId,
				parseInt(values.amount),
				values.reason,
				Type.TRANSFER,
				values.action,
				convertedDate,
				values.source,
				values.destination,
				null,
			]);
		} else {
			db.runSync(queries.add_transaction, [
				newTransactionId,
				parseInt(values.amount),
				values.reason,
				Type.INVESTMENT,
				values.action,
				convertedDate,
				values.source,
				null,
				values.investment,
			]);
		}
		values.setAmount("");
		values.setReason("");
		values.setSource("");
		values.setType(Type.GENERAL);
		values.setAction(Action.DEBIT);
		values.setInvestment("");
		values.setDestination("");
		values.setTrips([]);
		values.setCategories([]);
		navigate(transactionRoutes.main);
	};

	const deleteTransaction = (transactionId: string) => {
		db.runSync(queries.delete_transaction, [transactionId]);
		db.runSync(queries.delete_transaction_category, [transactionId]);
		db.runSync(queries.delete_transaction_trip, [transactionId]);
		navigate(transactionRoutes.main);
	};

	const updateTransaction = (id: string) => {
		deleteTransaction(id);
		addTransaction();
		navigate(transactionRoutes.main);
	};

	const fetchTransactionsForSource = (sourceId: string) => {
		return db.getAllSync<ITransaction>(
			queries.fetch_transactions_for_source,
			[sourceId, sourceId],
		);
	};

	const fetchTransactionsForCategory = (categoryId: string) => {
		return db.getAllSync<ITransaction>(
			queries.fetch_transactions_for_category,
			[categoryId],
		);
	};

	const fetchTransactionsForTrip = (tripId: string) => {
		return db.getAllSync<ITransaction>(
			queries.fetch_transactions_for_trip,
			[tripId],
		);
	};

	const fetchTransactionsForInvestment = (investmentId: string) => {
		return db.getAllSync<ITransaction>(
			queries.fetch_transactions_for_investment,
			[investmentId],
		);
	};

	const fetchTotalForSource = (sourceId: string) => {
		return (
			(
				db.getFirstSync<ITotal>(queries.fetch_total_for_source, [
					sourceId,
					sourceId,
					sourceId,
					sourceId,
				]) as ITotal
			).total ?? 0
		);
	};

	const fetchTotalForTrip = (sourceId: string) => {
		return (
			(
				db.getFirstSync<ITotal>(queries.fetch_total_for_trip, [
					sourceId,
				]) as ITotal
			).total ?? 0
		);
	};

	const fetchTotalForInvestment = (sourceId: string) => {
		return (
			(
				db.getFirstSync<ITotal>(queries.fetch_total_for_investment, [
					sourceId,
				]) as ITotal
			).total ?? 0
		);
	};

	const fetchTotalForCategory = (sourceId: string) => {
		return (
			(
				db.getFirstSync<ITotal>(queries.fetch_total_for_category, [
					sourceId,
				]) as ITotal
			).total ?? 0
		);
	};

	const fetchTotalForAll = () => {
		return (
			(db.getFirstSync<ITotal>(queries.fetch_total_for_all) as ITotal)
				.total ?? 0
		);
	};

	const fetchTripsForTransaction = (transactionId: string) => {
		return db
			.getAllSync<{
				tripId: string;
			}>(queries.fetch_trips_for_transaction, [transactionId])
			.map((trip) => trip.tripId);
	};

	const fetchCategoriesForTransaction = (transactionId: string) => {
		return db
			.getAllSync<{
				categoryId: string;
			}>(queries.fetch_categories_for_transaction, [transactionId])
			.map((category) => category.categoryId);
	};

	const transactionEditScreenFocus = (transactionId: string) => {
		const transaction = fetchTransaction(transactionId);
		values.setReason(transaction.reason);
		values.setAmount(String(transaction.amount));
		values.setDate(convertDateToString(transaction.date));
		values.setType(transaction.type);
		values.setSource(transaction.sourceId);
		values.setAction(transaction.action);
		values.setDestination(transaction.destinationId ?? null);
		values.setInvestment(transaction.investmentId ?? null);
		values.setTrips(fetchTripsForTransaction(transactionId));
		values.setCategories(fetchCategoriesForTransaction(transactionId));
	};

	return {
		fetchAllSources,
		fetchSource,
		addSource,
		updateSource,
		deleteSource,
		fetchAllTrips,
		fetchTrip,
		addTrip,
		updateTrip,
		deleteTrip,
		fetchAllCategories,
		fetchCategory,
		addCategory,
		updateCategory,
		deleteCategory,
		fetchAllInvestments,
		fetchInvestment,
		addInvestment,
		updateInvestment,
		deleteInvestment,
		fetchAllTransactions,
		fetchTransaction,
		addTransaction,
		deleteTransaction,
		updateTransaction,
		fetchTransactionsForSource,
		fetchTransactionsForCategory,
		fetchTransactionsForTrip,
		fetchTransactionsForInvestment,
		fetchTotalForSource,
		fetchTotalForTrip,
		fetchTotalForInvestment,
		fetchTotalForCategory,
		fetchTotalForAll,
		transactionEditScreenFocus,
	};
};

export default useDatabase;
