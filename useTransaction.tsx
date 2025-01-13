import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { formatDate } from "./HelperFunctions";
import IGroupedTransaction from "./IGroupedTransaction";
import ITransaction from "./ITransaction";
import { transactionRoutes } from "./Routes";
import Action from "./src/main/constants/enums/Action";
import Type from "./src/main/constants/enums/Type";
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

	const addTransaction = () => {
		const [d, m, y] = date.split("/");
		const fullDate = date.length === 10 ? date : `${d}/${m}/20${y}`;
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
		handlePlus,
		handleClose,
		handleDetail,
		handleEdit,
		handleDelete,
		groupedTransactions,
	};
};

const update_investment_amount = `
	UPDATE investment
	SET investedAmount = investedAmount + ? 
	WHERE id = ?;
`;

const update_source_amount = `
	UPDATE source
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

const insert_transaction_trip = `
	INSERT
	INTO transaction_trip (transactionId, tripId)
	VALUES (?, ?);
`;

const insert_transaction_category = `
	INSERT
	INTO transaction_category (transactionId, categoryId) 
	VALUES (?, ?);
`;

export default useTransaction;
