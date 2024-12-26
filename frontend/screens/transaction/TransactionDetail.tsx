import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import { formatDate, formatMoney } from "../../HelperFunctions";
import {
	LARGE_FONT_SIZE,
	PADDING,
	USABLE_SCREEN_HEIGHT,
} from "../../config/constants.config";
import ScreenLayout from "../../components/ScreenLayout";
import Vertical from "../../components/Vertical";
import CustomText from "../../components/CustomText";
import useTransactionService from "./TransactionService";
import TripRenderItem from "../trip/TripRenderItem";
import CategoryRenderItem from "../category/CategoryRenderItem";
import DataTab from "../../components/DataTab";
import useAppStore from "../../AppStore";

const plank = 0.35;
const UPPER_HALF_HEIGHT = USABLE_SCREEN_HEIGHT * plank;
const LIST_HEIGHT = (USABLE_SCREEN_HEIGHT - UPPER_HALF_HEIGHT) / (plank * 8);

const TransactionDetail = ({
	route: {
		params: { transactionId },
	},
}: any) => {
	const { handleEdit, handleDelete, fetchTransaction } =
		useTransactionService();
	const { setOnEdit, setOnDelete } = useAppStore();
	useFocusEffect(
		useCallback(() => {
			setOnEdit(() => handleEdit(transactionId));
			setOnDelete(() => handleDelete(transactionId));
		}, [transactionId]),
	);
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
	} = fetchTransaction(transactionId);
	return (
		<ScreenLayout>
			<View style={{ height: UPPER_HALF_HEIGHT }}>
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
