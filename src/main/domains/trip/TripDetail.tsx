import { tripRoutes } from "../../app/router/Routes";
import DataTab from "../../components/DataTab";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { formatMoney } from "../../util/HelperFunctions";
import LinkedTransactions from "../transaction/LinkedTransactions";

const TripDetail = ({ route }: any) => {
	const id = route.params.id;
	const { navigate } = useScreen();
	const {
		fetchTrip,
		fetchTransactionsForTrip,
		deleteTrip,
		fetchTotalForTrip,
	} = useDatabase();
	const trip = fetchTrip(id);
	const transactions = fetchTransactionsForTrip(id);
	const total = fetchTotalForTrip(id);

	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(tripRoutes.main)}
				handleEdit={() => navigate(tripRoutes.edit, id)}
				canBeDeleted={transactions.length === 0}
				handleDelete={() => deleteTrip(id)}
			/>
			<DataTab name={"Name"} value={trip.name} />
			<DataTab
				name={"Amount"}
				value={formatMoney(Math.abs(total))}
				debit={total < 0}
			/>
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default TripDetail;
