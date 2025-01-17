import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { transactionRoutes } from "../../app/router/Routes";
import Action from "../../constants/enums/Action";
import Type from "../../constants/enums/Type";
import useScreen from "../../hooks/useScreen";
import ICategory from "../category/ICategory";
import ITrip from "../trip/ITrip";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";

const todayDate = () => {
	const date = new Date();
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year % 100}`;
};

const useTransaction = (id: string = "") => {
	const db = useSQLiteContext();
	const { navigate } = useScreen();
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [date, setDate] = useState(todayDate());
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
			d?.length !== 2 ||
			m?.length !== 2 ||
			(y?.length !== 2 && y?.length !== 4)
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
		const oldTransaction = fetchTransaction();
		db.runSync(delete_transaction, [id]);
		db.runSync(update_source_amount, [
			oldTransaction.amount,
			oldTransaction.sourceId,
		]);
		if (oldTransaction.type === Type.GENERAL) {
			db.runSync(delete_trips_and_categories, [
				oldTransaction.id,
				oldTransaction.id,
			]);
		}
		if (
			oldTransaction.type === Type.TRANSFER &&
			oldTransaction.destinationId
		) {
			db.runSync(update_source_amount, [
				-oldTransaction.amount,
				oldTransaction.destinationId,
			]);
		}
		if (
			oldTransaction.type === Type.INVESTMENT &&
			oldTransaction.investmentId
		) {
			db.runSync(update_investment_amount, [
				-oldTransaction.amount,
				oldTransaction.investmentId,
			]);
		}
		navigate(transactionRoutes.main);
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
		const tAmount = action === Action.DEBIT ? -iAmount : iAmount;
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
		const { type } = fetchTransaction();
		const oldTransaction = fetchTransaction();
		const fullDate = extractDate();
		if (type === Type.GENERAL) {
			db.runSync(update_transaction, [
				iAmount,
				action,
				source,
				reason,
				fullDate,
				null,
				null,
				id,
			]);
			db.runSync(update_source_amount, [
				oldTransaction.amount,
				oldTransaction.sourceId,
			]);
			db.runSync(update_source_amount, [iAmount, source]);
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
		if (type === Type.TRANSFER) {
			db.runSync(update_transaction, [
				iAmount,
				Action.DEBIT,
				source,
				reason,
				fullDate,
				destination,
				null,
				id,
			]);
			db.runSync(update_source_amount, [
				oldTransaction.amount,
				oldTransaction.sourceId,
			]);
			db.runSync(update_source_amount, [
				-oldTransaction.amount,
				oldTransaction.destinationId as string,
			]);
			db.runSync(update_source_amount, [-iAmount, source]);
			db.runSync(update_source_amount, [iAmount, destination]);
		}
		if (type === Type.INVESTMENT) {
			db.runSync(update_transaction, [
				iAmount,
				action,
				source,
				reason,
				fullDate,
				null,
				investment,
				id,
			]);
			db.runSync(update_source_amount, [
				oldTransaction.amount,
				oldTransaction.sourceId,
			]);
			db.runSync(update_investment_amount, [
				-oldTransaction.amount,
				oldTransaction.investmentId as string,
			]);
			db.runSync(update_source_amount, [-iAmount, source]);
			db.runSync(update_investment_amount, [iAmount, investment]);
		}
		navigate(transactionRoutes.main);
	};

	return {
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

const delete_trips_and_categories = `
	DELETE FROM "transaction_trip" WHERE transactionId = ?;
	DELETE FROM "transaction_category" WHERE transactionId = ?;
`;

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
	SET amount = ?, action = ?, sourceId = ?, reason = ?, date = ?, destinationId = ?, investmentId = ?
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
