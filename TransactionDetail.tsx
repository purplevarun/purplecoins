import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import useAppStore from "./AppStore";
import CategoryRenderItem from "./CategoryRenderItem";
import CustomText from "./CustomText";
import DataTab from "./DataTab";
import Header from "./Header";
import { formatDate, formatMoney } from "./HelperFunctions";
import ScreenLayout from "./ScreenLayout";
import useTransactionService from "./TransactionService";
import TripRenderItem from "./TripRenderItem";
import Vertical from "./Vertical";
import {
	FLEX_ROW,
	LARGE_FONT_SIZE,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
	USABLE_SCREEN_HEIGHT,
} from "./constants.config";

const plank = 0.35;
const UPPER_HALF_HEIGHT = USABLE_SCREEN_HEIGHT * plank;
const LIST_HEIGHT = (USABLE_SCREEN_HEIGHT - UPPER_HALF_HEIGHT) / (plank * 8);

const TransactionDetail = ({ route }: any) => {
	const transactionId = route.params?.transactionId ?? null;
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
		sourceId,
		source,
		destinationId,
		destination,
		investmentId,
		investment,
		categories,
		trips,
	} = fetchTransaction(transactionId);

	return (
		<ScreenLayout>
			<Header
				title={"Transaction Details"}
				handleEdit={() => handleEdit(transactionId)}
				handleDelete={() => handleDelete(transactionId)}
			/>
			<View style={{ height: UPPER_HALF_HEIGHT }}>
				<DataTab name={"Amount"} value={formatMoney(amount)} />
				<DataTab name={"Reason"} value={reason} />
				<DataTab name={"Type"} value={type} />
				<DataTab name={"Date"} value={formatDate(date)} />
				<Source source={source} sourceId={sourceId} />
				<Destination
					destination={destination}
					destinationId={destinationId}
				/>
				<Investment
					investment={investment}
					investmentId={investmentId}
				/>
			</View>
			<Categories categories={categories} />
			<Trips trips={trips} />
		</ScreenLayout>
	);
};

const Investment = ({
	investment,
	investmentId,
}: {
	investment: string | undefined;
	investmentId: string | undefined;
}) => {
	const { navigate } = useNavigation<any>();
	if (investment)
		return (
			<View
				style={{
					justifyContent: SPACE_BETWEEN,
					flexDirection: FLEX_ROW,
					margin: MARGIN,
				}}
			>
				<CustomText text={"Investment"} />
				<TouchableOpacity
					onPress={() =>
						navigate("Investment.Detail", { investmentId })
					}
				>
					<CustomText text={investment} decoration={"underline"} />
				</TouchableOpacity>
			</View>
		);
};

const Destination = ({
	destination,
	destinationId,
}: {
	destination: string | undefined;
	destinationId: string | undefined;
}) => {
	const { navigate } = useNavigation<any>();
	if (destination)
		return (
			<View
				style={{
					justifyContent: SPACE_BETWEEN,
					flexDirection: FLEX_ROW,
					margin: MARGIN,
				}}
			>
				<CustomText text={"Destination"} />
				<TouchableOpacity
					onPress={() =>
						navigate("Source.Detail", {
							sourceId: destinationId,
						})
					}
				>
					<CustomText text={destination} decoration={"underline"} />
				</TouchableOpacity>
			</View>
		);
};

const Source = ({ source, sourceId }: { source: string; sourceId: string }) => {
	const { navigate } = useNavigation<any>();
	return (
		<View
			style={{
				justifyContent: SPACE_BETWEEN,
				flexDirection: FLEX_ROW,
				margin: MARGIN,
			}}
		>
			<CustomText text={"Source"} />
			<TouchableOpacity
				onPress={() => navigate("Source.Detail", { sourceId })}
			>
				<CustomText text={source} decoration={"underline"} />
			</TouchableOpacity>
		</View>
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
