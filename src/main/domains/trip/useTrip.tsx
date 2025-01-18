import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { tripRoutes } from "../../app/router/Routes";
import useScreen from "../../hooks/useScreen";
import ITransaction from "../transaction/ITransaction";
import ITrip from "./ITrip";

type ITotal = { total: number };
const useTrip = (id: string = "") => {
	const db = useSQLiteContext();
	const { navigate } = useScreen();
	const [name, setName] = useState("");
	const [trips, setTrips] = useState<ITrip[]>([]);

	const fetchTrips = () => {
		return db.getAllSync<ITrip>(fetch_all_trips);
	};

	const handleMainFocus = () => {
		setTrips(fetchTrips());
	};

	const handlePlus = () => {
		navigate(tripRoutes.add);
	};

	const handleClose = () => {
		navigate(tripRoutes.main);
	};
	const addTrip = () => {
		db.runSync(insert_trip, [randomUUID(), name.trim()]);
		navigate(tripRoutes.main);
	};

	const handleEdit = () => {
		navigate(tripRoutes.edit, id);
	};

	const handleDetail = () => {
		navigate(tripRoutes.detail, id);
	};

	const fetchTotalForCurrentTrip = () => {
		const result = db.getFirstSync<ITotal>(fetch_total_for_trip, [
			id,
		]) as ITotal;
		return result.total;
	};

	const deleteTrip = () => {
		db.runSync(delete_trip, [id]);
		db.runSync(delete_transaction_trip, [id]);
		navigate(tripRoutes.main);
	};

	const fetchTransactionsForTrip = () => {
		return db.getAllSync<ITransaction>(fetch_all_transactions_for_trip, [
			id,
		]);
	};

	const fetchOneTrip = () => {
		return db.getFirstSync<ITrip>(select_one_trip, [id]) as ITrip;
	};

	const handleEditFocus = () => {
		const trip = fetchOneTrip();
		setName(trip.name);
	};

	const updateTrip = () => {
		db.runSync(update_trip, [name, id]);
		navigate(tripRoutes.main);
	};

	const tripModels = fetchTrips().map(({ id, name }) => ({
		label: name,
		value: id,
	}));

	return {
		name,
		setName,
		trips,
		tripModels,
		handleMainFocus,
		fetchTrips,
		handlePlus,
		handleDetail,
		handleEdit,
		handleClose,
		addTrip,
		fetchTotalForCurrentTrip,
		deleteTrip,
		fetchTransactionsForTrip,
		fetchOneTrip,
		handleEditFocus,
		updateTrip,
	};
};

const delete_transaction_trip = `
	DELETE
	FROM "transaction_trip"
	WHERE tripId=?;
`;

const update_trip = `
	UPDATE "trip"
	SET name=?
	WHERE id=?;
`;

const delete_trip = `
	DELETE
	FROM "trip"
	WHERE id=?;
`;

const select_one_trip = `
	SELECT *
	FROM "trip"
	WHERE id=?;
`;

export const insert_trip = `
	INSERT
	INTO "trip" (id, name)
	VALUES (?, ?);
`;

const fetch_all_trips = `
	SELECT *
	FROM "trip";
`;

const fetch_total_for_trip = `
	SELECT COALESCE(SUM(t.amount), 0) AS total
	FROM "transaction" t
	JOIN "transaction_trip" tt ON t.id = tt.transactionId
	WHERE tt.tripId = ?;
`;

const fetch_all_transactions_for_trip = `
	SELECT t.*
	FROM "transaction" t
	JOIN transaction_trip tt ON t.id = tt.transactionId
	WHERE tt.tripId = ?;
`;
export default useTrip;
