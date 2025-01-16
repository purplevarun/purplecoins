import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { formatDate } from "./HelperFunctions";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";
import { transactionRoutes } from "./Routes";
import Action from "./src/main/constants/enums/Action";
import Type from "./src/main/constants/enums/Type";
import ICategory from "./src/main/domains/category/ICategory";
import ITrip from "./src/main/domains/trip/ITrip";
import useScreen from "./useScreen";

const useTransaction = (id: string = "") => {
	const db = useSQLiteContext();
	const { navigate } = useScreen();
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [date, setDate] = useState(formatDate(new Date()));
	const [source, setSource] = useState("");
	const [type, setType] = useState(Type.GENERAL);
	const [action, setAction] = useState(Action.DEBIT);
	const [investment, setInvestment] = useState<null | string>(null);
	const [destination, setDestination] = useState<null | string>(null);
	const [trips, setTrips] = useState<string[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [groupedTransactions, setGroupedTransactions] = useState<
		IGroupedTransaction[]
	>([]);

	const iAmount = useMemo(() => {
		if (amount === "") return 0;
		return parseInt(amount);
	}, [amount]);

	const enabled = useMemo(() => {
		if (iAmount === 0) return false;
		if (reason.length === 0) return false;
		if (date.length !== 10 && date.length !== 8) return false;
		const [d, m, y] = date.split("/");
		if (
			d?.length !== 2 || // Day must have 2 characters
			m?.length !== 2 || // Month must have 2 characters
			(y?.length !== 2 && y?.length !== 4) // Year must be either 2 or 4 characters
		) {
			return false;
		}
		return source.length > 0;
	}, [reason, iAmount, date, source]);

	const fetchTransactions = () => {
		return db.getAllSync<ITransaction>(select_all_transactions);
	};

	const createTransactionTrip = (transactionId: string, tripId: string) => {
		db.runSync(insert_transaction_trip, [transactionId, tripId]);
	};

	const createTransactionCategory = (
		transactionId: string,
		categoryId: string,
	) => {
		db.runSync(insert_transaction_category, [transactionId, categoryId]);
	};

	const fetchGroupedTransactions = (): IGroupedTransaction[] => {
		const transactions = fetchTransactions();
		type dateRecord = Record<string, typeof transactions>;
		const grouped = transactions.reduce<dateRecord>((acc, transaction) => {
			(acc[transaction.date] ||= []).push(transaction);
			return acc;
		}, {});
		return Object.entries(grouped)
			.sort(([dateA], [dateB]) => {
				const [dayA, monthA, yearA] = dateA.split("/");
				const [dayB, monthB, yearB] = dateB.split("/");
				return `${yearB}${monthB}${dayB}`.localeCompare(
					`${yearA}${monthA}${dayA}`,
				);
			})
			.map(([title, data]) => ({ title, data }));
	};

	const handleMainFocus = () => {
		setGroupedTransactions(fetchGroupedTransactions());
	};

	const handleEditFocus = () => {
		const {
			amount,
			reason,
			date,
			action,
			sourceId,
			investmentId,
			destinationId,
		} = fetchTransaction();
		setAmount(amount.toString());
		setReason(reason);
		setDate(date.slice(0, 6) + date.slice(-2));
		setAction(action);
		setSource(sourceId);
		investmentId && setInvestment(investmentId);
		destinationId && setDestination(destinationId);
		const trips = fetchTrips();
		const categories = fetchCategories();
		setTrips(trips.map((t) => t.id));
		setCategories(categories.map((c) => c.id));
	};

	const handlePlus = () => {
		navigate(transactionRoutes.add);
	};

	const handleClose = () => {
		navigate(transactionRoutes.main);
	};

	const handleDetail = () => {
		navigate(transactionRoutes.detail, id);
	};

	const handleEdit = () => {
		navigate(transactionRoutes.edit, id);
	};

	const handleDelete = () => {
		db.runSync(delete_transaction, [id]);
	};

	const getTAmount = (action: Action, iAmount: number) => {
		return action === Action.DEBIT ? -iAmount : iAmount;
	};

	const extractDate = () => {
		const [d, m, y] = date.split("/");
		if (date.length === 10) return date;
		const currentCentury = Math.floor(new Date().getFullYear() / 100);
		return `${d}/${m}/${currentCentury}${y}`;
	};

	const fetchTransaction = () => {
		return db.getFirstSync<ITransaction>(select_transaction, [
			id,
		]) as ITransaction;
	};

	const addTransaction = () => {
		const fullDate = extractDate();
		const newId = randomUUID();
		db.runSync(insert_into_transaction, [
			newId,
			iAmount,
			reason,
			type,
			action,
			fullDate,
			source,
			destination,
			investment,
		]);
		trips.forEach((trip) => createTransactionTrip(newId, trip));
		categories.forEach((category) =>
			createTransactionCategory(newId, category),
		);
		const tAmount = getTAmount(action, iAmount);
		db.runSync(update_source_amount, [tAmount, source]);
		if (type === Type.INVESTMENT)
			db.runSync(update_investment_amount, [-tAmount, investment]);
		if (type === Type.TRANSFER)
			db.runSync(update_source_amount, [-tAmount, destination]);
		navigate(transactionRoutes.main);
	};

	const fetchCategories = () => {
		return db.getAllSync<ICategory>(select_categories_for_transaction, [
			id,
		]);
	};

	const fetchTrips = () => {
		return db.getAllSync<ITrip>(select_trips_for_transaction, [id]);
	};

	const updateTransaction = () => {
		const tAmount = getTAmount(action, iAmount);
		const fullDate = extractDate();
		const oldTransaction = fetchTransaction();
		if (oldTransaction.type === Type.GENERAL) {
			db.runSync(update_transaction, [
				iAmount,
				action,
				source,
				reason,
				fullDate,
				id,
			]);
			const oldTAmount = getTAmount(
				oldTransaction.action,
				oldTransaction.amount,
			);
			// source
			if (source === oldTransaction.sourceId) {
				db.runSync(update_source_amount, [
					tAmount - oldTAmount,
					source,
				]);
			} else {
				db.runSync(update_source_amount, [
					-oldTAmount,
					oldTransaction.sourceId,
				]);
				db.runSync(update_source_amount, [tAmount, source]);
			}
			// Trips
			const oldTrips = fetchTrips();
			if (
				oldTrips.length !== trips.length ||
				!oldTrips.every(({ id }, index) => id === trips[index])
			) {
				oldTrips.forEach(({ id: oldTripId }) =>
					db.runSync(delete_transaction_trip, [id, oldTripId]),
				);
				trips.forEach((trip) =>
					db.runSync(insert_transaction_trip, [id, trip]),
				);
			}

			// Categories
			const oldCategories = fetchCategories();
			if (
				oldCategories.length !== categories.length ||
				!oldCategories.every(
					({ id }, index) => id === categories[index],
				)
			) {
				oldCategories.forEach(({ id: oldCategoryId }) =>
					db.runSync(delete_transaction_category, [
						id,
						oldCategoryId,
					]),
				);
				categories.forEach((category) =>
					db.runSync(insert_transaction_category, [id, category]),
				);
			}
		}
		navigate(transactionRoutes.main);
	};

	const isGeneral = type === Type.GENERAL;
	const isInvestment = type === Type.INVESTMENT;
	const isTransfer = type === Type.TRANSFER;

	return {
		isGeneral,
		isInvestment,
		isTransfer,
		amount,
		setAmount,
		reason,
		setReason,
		date,
		source,
		setSource,
		type,
		setType,
		action,
		setAction,
		investment,
		setInvestment,
		destination,
		setDestination,
		enabled,
		trips,
		setTrips,
		setDate,
		categories,
		setCategories,
		fetchTransactions,
		addTransaction,
		handleMainFocus,
		handleEditFocus,
		handlePlus,
		handleClose,
		handleDetail,
		handleEdit,
		handleDelete,
		updateTransaction,
		groupedTransactions,
		fetchTransaction,
		fetchCategories,
		fetchTrips,
	};
};

const select_trips_for_transaction = `
	SELECT t.* 
	FROM "trip" t
	JOIN "transaction_trip" tt ON t.id = tt.tripId
	WHERE tt.transactionId = ?;
`;

const select_categories_for_transaction = `
	SELECT c.* 
	FROM "category" c
	JOIN "transaction_category" tc ON c.id = tc.categoryId
	WHERE tc.transactionId = ?;
`;

const select_transaction = `
	SELECT *
	FROM "transaction"
	WHERE id = ?;
`;

const update_transaction = `
	UPDATE "transaction"
	SET amount = ?, action = ?, sourceId = ?, reason = ?, date = ?
	WHERE id = ?;
`;

const update_investment_amount = `
	UPDATE "investment"
	SET investedAmount = investedAmount + ? 
	WHERE id = ?;
`;

const update_source_amount = `
	UPDATE "source"
	SET amount = amount + ? 
	WHERE id = ?;
`;

const insert_into_transaction = `
	INSERT
	INTO "transaction" (id, amount, reason, type, action, date, sourceId, destinationId, investmentId) 
	VALUES (?,?,?,?,?,?,?,?,?);
`;

const delete_transaction = `
	DELETE
	FROM "transaction"
	WHERE id = ?;
`;

const select_all_transactions = `
	SELECT *
	FROM "transaction";
`;

const delete_transaction_trip = `
	DELETE
	FROM "transaction_trip"
	WHERE transactionId = ? AND tripId = ?;
`;

const delete_transaction_category = `
	DELETE
	FROM "transaction_category"
	WHERE transactionId = ? AND categoryId = ?;
`;

const insert_transaction_trip = `
	INSERT
	INTO "transaction_trip" (transactionId, tripId)
	VALUES (?, ?);
`;

const insert_transaction_category = `
	INSERT
	INTO "transaction_category" (transactionId, categoryId) 
	VALUES (?, ?);
`;

export default useTransaction;
