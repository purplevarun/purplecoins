import {
	CENTER,
	FLEX_ROW,
	LARGE_FONT_SIZE, PADDING,
	SPACE_BETWEEN
} from "../../../config/constants.config";
import { FlatList, View } from "react-native";
import { formatDate } from "../../../util/helpers/HelperFunctions";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
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
		fetchTransactionsForCurrentTrip,
		clearStore
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
				<View style={{ paddingTop: PADDING }}>
					<CustomText
						text={"Linked Transactions"}
						fontSize={LARGE_FONT_SIZE}
					/>
					<Vertical />
					<FlatList
						data={transactions}
						renderItem={({ item }) => <TransactionRenderItem item={item} />}
					/>
				</View>
			}
		</ScreenLayout>
	);
};

export default TripDetail;