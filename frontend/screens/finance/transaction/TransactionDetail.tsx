import { FlatList, View } from "react-native";
import { formatDate, formatMoney } from "../../../util/helpers/HelperFunctions";
import { CENTER, FLEX_ROW, FONT_SIZE, LARGE_FONT_SIZE, PADDING, SPACE_BETWEEN } from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import TransactionRoutes from "./TransactionRoutes";
import EditButton from "../../../components/EditButton";
import DeleteButton from "../../../components/DeleteButton";
import Vertical from "../../../components/Vertical";
import CustomText from "../../../components/CustomText";
import useTransactionService from "./TransactionService";
import { PRIMARY_COLOR } from "../../../config/colors.config";
import TripRenderItem from "../trip/TripRenderItem";

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
	return (
		<ScreenLayout>
			<CloseButton path={TransactionRoutes.Main} />
			<EditButton onPress={handleEdit} />
			<DeleteButton onDelete={handleDelete} />
			<Vertical />
			<CustomText
				text={"Transaction Details"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
				right={FONT_SIZE}
			/>
			<Vertical size={5} />
			<Tab name={"Amount"} value={formatMoney(amount)} />
			<Tab name={"Reason"} value={reason} />
			<Tab name={"Type"} value={type} />
			<Tab name={"Date"} value={formatDate(date)} />
			<Tab name={"Source"} value={source} />
			{destination && <Tab name={"Destination"} value={destination} />}
			{investment && <Tab name={"Investment"} value={investment} />}
			{categories && <View style={{ paddingTop: PADDING }}>
				<CustomText text={"Categories"} fontSize={FONT_SIZE * 1.1} />
				<FlatList
					data={JSON.parse(categories)}
					renderItem={({ item }) => <CustomText text={item.name} />}
				/>
			</View>}
			{trips && <View style={{ paddingTop: PADDING }}>
				<CustomText text={"Trips"} fontSize={FONT_SIZE * 1.1} />
				<FlatList
					data={JSON.parse(trips)}
					renderItem={({ item }) => <TripRenderItem item={item}/>}
				/>
			</View>}
		</ScreenLayout>
	);
};

const Tab = ({ name, value }: { name: string, value: string | number }) => {
	return <View
		style={{
			justifyContent: SPACE_BETWEEN,
			flexDirection: FLEX_ROW
		}}
	>
		<CustomText text={name} />
		<CustomText text={value} />
	</View>;
};

export default TransactionDetail;