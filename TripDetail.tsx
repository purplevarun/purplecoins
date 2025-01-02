import DataTab from "./DataTab";
import Header from "./Header";
import { formatDate } from "./HelperFunctions";
import LinkedTransactions from "./LinkedTransactions";
import ScreenLayout from "./ScreenLayout";
import useTripService from "./TripService";

const TripDetail = ({ route }: any) => {
	const tripId = route.params.tripId;
	const {
		handleEdit,
		handleDelete,
		fetchCurrentTrip,
		fetchTransactionsForCurrentTrip,
	} = useTripService();
	const transactions = fetchTransactionsForCurrentTrip(tripId);
	const trip = fetchCurrentTrip(tripId);

	return (
		<ScreenLayout>
			<Header
				title={"Trip Details"}
				handleDelete={() => handleDelete(tripId)}
				handleEdit={() => handleEdit(tripId)}
			/>
			<DataTab name={"Trip Name"} value={trip.name} />
			<DataTab name={"Start Date"} value={formatDate(trip.startDate)} />
			<DataTab name={"End Date"} value={formatDate(trip.endDate)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default TripDetail;
