import {
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE,
	SPACE_BETWEEN
} from "../../../config/constants.config";
import { FlatList, View } from "react-native";
import { formatDate } from "../../../util/helpers/HelperFunctions";
import { PRIMARY_COLOR } from "../../../config/colors.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import TripRoutes from "./TripRoutes";
import Vertical from "../../../components/Vertical";
import DeleteButton from "../../../components/DeleteButton";
import EditButton from "../../../components/EditButton";
import useTripService from "./TripService";
import TransactionRenderItem from "../transaction/TransactionRenderItem";

const TripDetail = () => {
	const {
		handleEdit,
		handleDelete,
		fetchCurrentTrip,
		fetchTransactionsForCurrentTrip
	} = useTripService();
	const transactions = fetchTransactionsForCurrentTrip();
	const trip = fetchCurrentTrip();

	return (
		<ScreenLayout>
			<CloseButton path={TripRoutes.Main} />
			<EditButton onPress={handleEdit} />
			<DeleteButton onDelete={handleDelete} />
			<Vertical />
			<CustomText text={"Trip Details"} alignSelf={CENTER} fontSize={LARGE_FONT_SIZE} />
			<Vertical size={5} />
			<View style={{ justifyContent: SPACE_BETWEEN, flexDirection: FLEX_ROW }}>
				<CustomText text={"Trip Name"} />
				<CustomText text={trip.name} />
			</View>
			<View style={{ justifyContent: SPACE_BETWEEN, flexDirection: FLEX_ROW }}>
				<CustomText text={"Start Date"} />
				<CustomText text={formatDate(trip.startDate)} />
			</View>
			<View style={{ justifyContent: SPACE_BETWEEN, flexDirection: FLEX_ROW }}>
				<CustomText text={"End Date"} />
				<CustomText text={formatDate(trip.endDate)} />
			</View>
			{transactions && transactions.length > 0 &&
				<FlatList
					data={transactions}
					renderItem={({ item }) => <TransactionRenderItem item={item} />}
				/>
			}
		</ScreenLayout>
	);
};

export default TripDetail;