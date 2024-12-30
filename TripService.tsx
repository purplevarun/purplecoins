import { generateUUID } from "./HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import {
	delete_single_trip,
	fetch_all_trips,
	fetch_total_for_trip,
	fetch_single_trip,
	fetch_all_transactions_for_trip,
	insert_trip_with_start_and_end_date,
	insert_trip_with_start_date,
	insert_trip_without_date,
	select_all_users,
	update_trip_with_start_and_end_date,
	update_trip_with_start_date,
	update_trip_without_date,
} from "./queries.config";
import useTripStore from "./TripStore";
import ITrip from "./ITrip";
import ITransaction from "./ITransaction";
import IUser from "./IUser";
import Routes from "./Routes";

const useTripService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
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
	} = useTripStore();
	const { navigate } = useNavigation<any>();

	const addNewTrip = (tripId: string | null) => {
		if (tripId) {
			try {
				if (startDateSet && endDateSet)
					db.runSync(update_trip_with_start_and_end_date, [
						name,
						startDate.toString(),
						endDate.toString(),
						tripId,
					]);
				else if (startDateSet)
					db.runSync(update_trip_with_start_date, [
						name,
						startDate.toString(),
						tripId,
					]);
				else db.runSync(update_trip_without_date, [name, tripId]);
				console.log("updated trip");
			} catch (e) {
				console.log("ERROR: updating trip", e);
			}
		} else {
			try {
				const id = generateUUID();
				if (startDateSet && endDateSet)
					db.runSync(insert_trip_with_start_and_end_date, [
						id,
						userId,
						name,
						startDate.toString(),
						endDate.toString(),
					]);
				else if (startDateSet)
					db.runSync(insert_trip_with_start_date, [
						id,
						userId,
						name,
						startDate.toString(),
					]);
				else db.runSync(insert_trip_without_date, [id, userId, name]);
				console.log("created new trip");
			} catch (e) {
				console.log("ERROR: creating trip", e);
			}
		}
		clearStore();
		navigate(Routes.Trip.Main);
	};

	const fetchTrips = () => {
		try {
			const trips = db.getAllSync<ITrip>(fetch_all_trips, [userId]);
			console.log("fetched trips", trips);
			return trips;
		} catch (e) {
			console.log("ERROR: fetching trips", e);
			return [];
		}
	};

	const fetchCurrentTrip = (tripId: string) => {
		return db.getFirstSync<ITrip>(fetch_single_trip, [tripId]) as ITrip;
	};

	const fetchTransactionsForCurrentTrip = (tripId: string) => {
		return db.getAllSync<ITransaction>(fetch_all_transactions_for_trip, [
			tripId,
		]);
	};

	const fetchTotalForCurrentTrip = (tripId: string) => {
		return (
			db.getFirstSync<{
				total: number;
			}>(fetch_total_for_trip, [tripId])?.total ?? 0
		);
	};

	const handleEdit = (tripId: string) => {
		const trip = fetchCurrentTrip(tripId);
		setName(trip.name);
		if (trip.startDate) {
			setStartDateSet(true);
			setStartDate(new Date(trip.startDate));
			if (trip.endDate) {
				setEndDateSet(true);
				setEndDate(new Date(trip.endDate));
			}
		}
		navigate(Routes.Trip.Add, { tripId });
	};

	const handleDelete = (tripId: string) => {
		db.runSync(delete_single_trip, [tripId]);
		navigate(Routes.Trip.Main);
	};

	const clearStore = () => {
		setName("");
		setStartDate(new Date());
		setEndDate(new Date());
		setStartDateSet(false);
		setEndDateSet(false);
	};

	return {
		addNewTrip,
		fetchTrips,
		clearStore,
		handleEdit,
		handleDelete,
		fetchCurrentTrip,
		fetchTransactionsForCurrentTrip,
		fetchTotalForCurrentTrip,
	};
};

export default useTripService;
