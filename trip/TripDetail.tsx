import DataTab from "../DataTab";
import Header from "../Header";
import LinkedTransactions from "../LinkedTransactions";
import ScreenLayout from "../ScreenLayout";
import useTrip from "./useTrip";

const TripDetail = ({ route }: any) => {
	const {
		handleClose,
		handleEdit,
		deleteTrip,
		fetchTransactionsForTrip,
		fetchOneTrip,
	} = useTrip(route.params.id);
	const transactions = fetchTransactionsForTrip();
	const trip = fetchOneTrip();

	return (
		<ScreenLayout>
			<Header
				handleDelete={deleteTrip}
				handleEdit={handleEdit}
				handleClose={handleClose}
				canBeDeleted={transactions.length === 0}
			/>
			<DataTab name={"Trip Name"} value={trip.name} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default TripDetail;
