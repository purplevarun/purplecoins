import { FlatList, View } from "react-native";
import { formatDate, formatMoney } from "../../../util/helpers/HelperFunctions";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	PADDING,
	USABLE_SCREEN_HEIGHT
} from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import EditButton from "../../../components/EditButton";
import DeleteButton from "../../../components/DeleteButton";
import Vertical from "../../../components/Vertical";
import CustomText from "../../../components/CustomText";
import useTransactionService from "./TransactionService";
import TripRenderItem from "../trip/TripRenderItem";
import CategoryRenderItem from "../category/CategoryRenderItem";
import DataTab from "../../../components/DataTab";

const TransactionDetail = () => {
	const {
		handleEdit,
		handleDelete,
		fetchTransaction
	} = useTransactionService();
	const {
		amount,
		reason,
		type,
		date,
		source,
		destination,
		investment,
		categories,
		trips
	} = fetchTransaction();

	const plank = 0.32;
	const UPPER_HALF_HEIGHT = USABLE_SCREEN_HEIGHT * plank;
	const LIST_HEIGHT = (USABLE_SCREEN_HEIGHT - UPPER_HALF_HEIGHT) / (plank * 10);

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
				{destination && <DataTab name={"Destination"} value={destination} />}
				{investment && <DataTab name={"Investment"} value={investment} />}
			</View>
			{categories && <View>
				<CustomText text={"Categories"} fontSize={LARGE_FONT_SIZE} />
				<Vertical size={2} />
				<FlatList
					style={{ maxHeight: LIST_HEIGHT }}
					data={JSON.parse(categories)}
					renderItem={({ item }) => <CategoryRenderItem item={item} />}
				/>
			</View>}
			{trips && <View style={{ paddingTop: PADDING }}>
				<CustomText text={"Trips"} fontSize={LARGE_FONT_SIZE} />
				<Vertical size={2} />
				<FlatList
					style={{ maxHeight: LIST_HEIGHT }}
					data={JSON.parse(trips)}
					renderItem={({ item }) => <TripRenderItem item={item} />}
				/>
			</View>}
		</ScreenLayout>
	);
};

export default TransactionDetail;