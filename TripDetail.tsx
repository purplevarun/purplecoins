import { formatDate } from "./HelperFunctions";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "./ScreenLayout";
import useTripService from "./TripService";
import DataTab from "./DataTab";
import LinkedTransactions from "./LinkedTransactions";
import useAppStore from "./AppStore";

const TripDetail = ({
	route: {
		params: { tripId },
	},
}: any) => {
	if (!tripId) return null;
	const {
		handleEdit,
		handleDelete,
		fetchCurrentTrip,
		fetchTransactionsForCurrentTrip,
	} = useTripService();
	const { setOnDelete, setOnEdit } = useAppStore();
	const transactions = fetchTransactionsForCurrentTrip(tripId);
	const trip = fetchCurrentTrip(tripId);
	useFocusEffect(
		useCallback(() => {
			setOnDelete(() => handleDelete(tripId));
			setOnEdit(() => handleEdit(tripId));
		}, [tripId]),
	);

	if (!trip) return null;
	return (
		<ScreenLayout>
			<DataTab name={"Trip Name"} value={trip.name} />
			<DataTab name={"Start Date"} value={formatDate(trip.startDate)} />
			<DataTab name={"End Date"} value={formatDate(trip.endDate)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default TripDetail;
