import { CENTER, LARGE_FONT_SIZE } from "../../config/constants.config";
import { formatDate } from "../../HelperFunctions";
import ScreenLayout from "../../components/ScreenLayout";
import CustomText from "../../components/CustomText";
import CloseButton from "../../components/CloseButton";
import Vertical from "../../components/Vertical";
import DeleteButton from "../../components/DeleteButton";
import EditButton from "../../components/EditButton";
import useTripService from "./TripService";
import DataTab from "../../components/DataTab";
import LinkedTransactions from "../../components/LinkedTransactions";

const TripDetail = () => {
	const {
		handleEdit,
		handleDelete,
		fetchCurrentTrip,
		fetchTransactionsForCurrentTrip,
		clearStore,
	} = useTripService();
	const transactions = fetchTransactionsForCurrentTrip();
	const trip = fetchCurrentTrip();

	return (
		<ScreenLayout>
			<CloseButton onPress={clearStore} />
			<EditButton onPress={handleEdit} />
			<DeleteButton onDelete={handleDelete} />
			<Vertical />
			<CustomText
				text={"Trip Details"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={5} />
			<DataTab name={"Trip Name"} value={trip.name} />
			<DataTab name={"Start Date"} value={formatDate(trip.startDate)} />
			<DataTab name={"End Date"} value={formatDate(trip.endDate)} />
			<LinkedTransactions transactions={transactions} />
		</ScreenLayout>
	);
};

export default TripDetail;
