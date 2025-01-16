import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import DataTab from "./DataTab";
import DataTabWrapper from "./DataTabWrapper";
import Header from "./Header";
import { formatMoney } from "./HelperFunctions";
import { categoryRoutes, tripRoutes } from "./Routes";
import ScreenLayout from "./ScreenLayout";
import { FLEX_ROW, PADDING } from "./constants.config";
import useInvestment from "./src/main/domains/investment/useInvestment";
import useSource from "./src/main/domains/source/useSource";
import useScreen from "./useScreen";
import useTransaction from "./useTransaction";

const TransactionDetail = ({ route }: any) => {
	const transactionId = route.params.id;
	const { handleClose, handleEdit, handleDelete, fetchTransaction } =
		useTransaction(transactionId);
	const {
		amount,
		reason,
		type,
		date,
		action,
		sourceId,
		destinationId,
		investmentId,
	} = fetchTransaction();

	return (
		<ScreenLayout>
			<Header
				handleClose={handleClose}
				handleEdit={handleEdit}
				handleDelete={handleDelete}
			/>
			<DataTab name={"Amount"} value={formatMoney(amount)} />
			<DataTab name={"Reason"} value={reason} />
			<DataTab name={"Type"} value={type} />
			<DataTab name={"Action"} value={action} />
			<DataTab name={"Date"} value={date} />
			<Source sourceId={sourceId} />
			<Source sourceId={destinationId} destination />
			<Investment investmentId={investmentId} />
			<Categories transactionId={transactionId} />
			<Trips transactionId={transactionId} />
		</ScreenLayout>
	);
};

const Trips = ({ transactionId }: { transactionId: string }) => {
	const { fetchTrips } = useTransaction(transactionId);
	const { navigate } = useScreen();
	const trips = fetchTrips();
	if (trips.length === 0) return null;
	return (
		<DataTabWrapper>
			<CustomText text={"Trips"} />
			<View style={styles.multiData}>
				{trips.map((trip) => {
					const onPress = () => navigate(tripRoutes.detail, trip.id);
					return (
						<TouchableOpacity onPress={onPress} key={trip.id}>
							<CustomText
								text={trip.name}
								decoration={"underline"}
							/>
						</TouchableOpacity>
					);
				})}
			</View>
		</DataTabWrapper>
	);
};

const Categories = ({ transactionId }: { transactionId: string }) => {
	const { fetchCategories } = useTransaction(transactionId);
	const { navigate } = useScreen();
	const categories = fetchCategories();
	if (categories.length === 0) return null;

	return (
		<DataTabWrapper>
			<CustomText text={"Categories"} />
			<View style={styles.multiData}>
				{categories.map((category) => {
					const onPress = () =>
						navigate(categoryRoutes.detail, category.id);
					return (
						<TouchableOpacity onPress={onPress} key={category.id}>
							<CustomText
								text={category.name}
								decoration={"underline"}
							/>
						</TouchableOpacity>
					);
				})}
			</View>
		</DataTabWrapper>
	);
};

const styles = StyleSheet.create({
	multiData: {
		flexDirection: FLEX_ROW,
		gap: PADDING,
		justifyContent: "flex-end",
		maxWidth: "50%",
		flexWrap: "wrap",
	},
});

const Source = ({
	sourceId,
	destination = false,
}: {
	sourceId?: string;
	destination?: boolean;
}) => {
	if (!sourceId) return;
	const { handleDetail, fetchOneSource } = useSource(sourceId);
	const { name } = fetchOneSource();
	return (
		<DataTabWrapper>
			<CustomText text={destination ? "Destination" : "Source"} />
			<TouchableOpacity onPress={handleDetail}>
				<CustomText text={name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

const Investment = ({ investmentId }: { investmentId?: string }) => {
	if (!investmentId) return;
	const { handleDetail, fetchOneInvestment } = useInvestment(investmentId);
	const { name } = fetchOneInvestment();
	return (
		<DataTabWrapper>
			<CustomText text={"Investment"} />
			<TouchableOpacity onPress={handleDetail}>
				<CustomText text={name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

export default TransactionDetail;
