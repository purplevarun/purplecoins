import { generateUUID, logger } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import useTripStore from "./TripStore";
import useAuthService from "../../auth/AuthService";
import TripRoutes from "./TripRoutes";
import ITrip from "../../../interfaces/ITrip";
import ITransaction from "../../../interfaces/ITransaction";

const useTripService = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();
	const {
		name,
		setName,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		startDateSet,
		setStartDateSet,
		endDateSet,
		setEndDateSet,
		currentTripId,
		setCurrentTripId
	} = useTripStore();
	const { navigate } = useNavigation<any>();

	const isEdit = () => currentTripId.length !== 0;

	const addNewTrip = () => {
		if (isEdit()) {
			try {
				const bothQuery = "UPDATE trip SET name = ?, startDate = ?, endDate = ? WHERE id = ?";
				const singleQuery = "UPDATE trip SET name = ?, startDate = ? WHERE id = ?";
				const noneQuery = "UPDATE trip SET name = ? WHERE id = ?";
				if (startDateSet && endDateSet) db.runSync(bothQuery, [name, startDate.toString(), endDate.toString(), currentTripId]);
				else if (startDateSet) db.runSync(singleQuery, [name, startDate.toString(), currentTripId]);
				else db.runSync(noneQuery, [name, currentTripId]);
				logger("updated trip");
			} catch (e) {
				logger("ERROR: updating trip", e);
			}
		} else {
			try {
				const id = generateUUID();
				const bothQuery = "INSERT INTO trip (id, userId, name, startDate, endDate) VALUES (?, ?, ?, ?, ?)";
				const singleQuery = "INSERT INTO trip (id, userId, name, startDate) VALUES (?, ?, ?, ?)";
				const noneQuery = "INSERT INTO trip (id, userId, name) VALUES (?, ?, ?)";
				if (startDateSet && endDateSet) db.runSync(bothQuery, [id, userId, name, startDate.toString(), endDate.toString()]);
				else if (startDateSet) db.runSync(singleQuery, [id, userId, name, startDate.toString()]);
				else db.runSync(noneQuery, [id, userId, name]);
				logger("created new trip");
			} catch (e) {
				logger("ERROR: creating trip", e);
			}
		}
		clearStore();
		navigate(TripRoutes.Main);
	};

	const fetchTrips = () => {
		try {
			const trips = db.getAllSync<ITrip>("SELECT t.* from trip t where userId=?", [userId]);
			logger("fetched trips", trips);
			return trips;
		} catch (e) {
			logger("ERROR: fetching trips", e);
			return [];
		}
	};

	const fetchCurrentTrip = () => {
		return db.getFirstSync<ITrip>("SELECT * FROM trip WHERE id = ?;", [currentTripId]) as ITrip;
	};

	const fetchTransactionsForCurrentTrip = () => {
		return db.getAllSync<ITransaction>(`SELECT t.* FROM transaction_record t JOIN transaction_trip tt ON t.id = tt.transactionId WHERE tt.tripId = ?;`, [currentTripId]);
	};

	const fetchTotalForCurrentTrip = (tripId: string) => {
		return db.getFirstSync<{
			total: number
		}>(`SELECT sum(t.amount) as total FROM transaction_record t JOIN transaction_trip tt ON t.id = tt.transactionId WHERE tt.tripId = ?;`, [tripId])?.total ?? 0;
	};

	const handleEdit = () => {
		const trip = fetchCurrentTrip();
		setName(trip.name);
		if (trip.startDate) {
			setStartDateSet(true);
			setStartDate(new Date(trip.startDate));
			if (trip.endDate) {
				setEndDateSet(true);
				setEndDate(new Date(trip.endDate));
			}
		}
		navigate(TripRoutes.Add);
	};

	const handleDelete = () => {
		db.runSync("DELETE FROM trip WHERE id = ?;", [currentTripId]);
		navigate(TripRoutes.Main);
	};

	const selectTrip = (tripId: string) => {
		setCurrentTripId(tripId);
		navigate(TripRoutes.Detail);
	};

	const clearStore = () => {
		setName("");
		setStartDate(new Date());
		setEndDate(new Date());
		setStartDateSet(false);
		setEndDateSet(false);
		setCurrentTripId("");
	};

	return {
		addNewTrip,
		fetchTrips,
		clearStore,
		handleEdit,
		handleDelete,
		selectTrip,
		fetchCurrentTrip,
		fetchTransactionsForCurrentTrip,
		fetchTotalForCurrentTrip,
		isEdit
	};
};

export default useTripService;