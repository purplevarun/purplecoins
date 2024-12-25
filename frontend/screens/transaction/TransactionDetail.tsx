import { FlatList, View } from "react-native";
import { formatDate, formatMoney } from "../../HelperFunctions";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	PADDING,
	USABLE_SCREEN_HEIGHT,
} from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import CloseButton from "../../components/CloseButton";
import EditButton from "../../components/EditButton";
import DeleteButton from "../../components/DeleteButton";
import Vertical from "../../components/Vertical";
import CustomText from "../../components/CustomText";
import useTransactionService from "./TransactionService";
import TripRenderItem from "../trip/TripRenderItem";
import CategoryRenderItem from "../category/CategoryRenderItem";
import DataTab from "../../components/DataTab";

const plank = 0.35;
const UPPER_HALF_HEIGHT = USABLE_SCREEN_HEIGHT * plank;
const LIST_HEIGHT = (USABLE_SCREEN_HEIGHT - UPPER_HALF_HEIGHT) / (plank * 8);

const TransactionDetail = () => {
	const { handleEdit, handleDelete, fetchTransaction } =
		useTransactionService();
	const {
		amount,
		reason,
		type,
		date,
		source,
		destination,
		investment,
		categories,
		trips,
	} = fetchTransaction();

	return (
		<ScreenLayout>
			<View style={{ height: UPPER_HALF_HEIGHT }}>
				<CloseButton />
				<EditButton onPress={handleEdit} />
				<DeleteButton onDelete={handleDelete} />
				<Vertical />
				<CustomText
					text={"Transaction Details"}
					alignSelf={CENTER}
					fontSize={LARGE_FONT_SIZE}
					right={FONT_SIZE}
				/>
				<Vertical size={3} />
				<DataTab name={"Amount"} value={formatMoney(amount)} />
				<DataTab name={"Reason"} value={reason} />
				<DataTab name={"Type"} value={type} />
				<DataTab name={"Date"} value={formatDate(date)} />
				<DataTab name={"Source"} value={source} />
				<DataTab name={"Destination"} value={destination} />
				<DataTab name={"Investment"} value={investment} />
			</View>
			<Categories categories={categories} />
			<Trips trips={trips} />
		</ScreenLayout>
	);
};

const Trips = ({ trips }: { trips: string | undefined }) => {
	if (trips)
		return (
			<View style={{ paddingTop: PADDING }}>
				<CustomText text={"Trips"} fontSize={LARGE_FONT_SIZE} />
				<Vertical />
				<FlatList
					style={{ maxHeight: LIST_HEIGHT }}
					data={JSON.parse(trips)}
					renderItem={({ item }) => <TripRenderItem item={item} />}
				/>
			</View>
		);
};

const Categories = ({ categories }: { categories: string | undefined }) => {
	if (categories)
		return (
			<View>
				<CustomText text={"Categories"} fontSize={LARGE_FONT_SIZE} />
				<Vertical />
				<FlatList
					style={{ maxHeight: LIST_HEIGHT }}
					data={JSON.parse(categories)}
					renderItem={({ item }) => (
						<CategoryRenderItem item={item} />
					)}
				/>
			</View>
		);
};

export default TransactionDetail;
