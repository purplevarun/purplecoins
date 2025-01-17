import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import LinkedTransactions from "../transaction/LinkedTransactions";
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
