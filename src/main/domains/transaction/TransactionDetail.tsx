import { useSQLiteContext } from "expo-sqlite";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	categoryRoutes,
	investmentRoutes,
	sourceRoutes,
	transactionRoutes,
	tripRoutes,
} from "../../app/router/Routes";
import CustomText from "../../components/CustomText";
import DataTab from "../../components/DataTab";
import DataTabWrapper from "../../components/DataTabWrapper";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import { FLEX_ROW, PADDING } from "../../constants/constants.config";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import { convertDateToString, formatMoney } from "../../util/HelperFunctions";
import ICategory from "../category/ICategory";
import ITrip from "../trip/ITrip";

const TransactionDetail = ({ route }: { route: any }) => {
	const transactionId = route.params.id;
	const { navigate } = useScreen();
	const { fetchTransaction, deleteTransaction } = useDatabase();
	const transaction = fetchTransaction(transactionId);
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(transactionRoutes.main)}
				handleEdit={() =>
					navigate(transactionRoutes.edit, transactionId)
				}
				handleDelete={() => deleteTransaction(transactionId)}
				canBeDeleted={true}
			/>
			<DataTab name={"Amount"} value={formatMoney(transaction.amount)} />
			<DataTab name={"Reason"} value={transaction.reason} />
			<DataTab name={"Type"} value={transaction.type} />
			<DataTab name={"Action"} value={transaction.action} />
			<DataTab
				name={"Date"}
				value={convertDateToString(transaction.date)}
			/>
			<Source sourceId={transaction.sourceId} />
			<Source sourceId={transaction.destinationId} destination />
			<Investment investmentId={transaction.investmentId} />
			<Categories transactionId={transactionId} />
			<Trips transactionId={transactionId} />
		</ScreenLayout>
	);
};

const Trips = ({ transactionId }: { transactionId: string }) => {
	const { navigate } = useScreen();
	const db = useSQLiteContext();
	const trips = db.getAllSync<ITrip>(select_trips_for_transaction, [
		transactionId,
	]);

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
	const { navigate } = useScreen();
	const db = useSQLiteContext();
	const categories = db.getAllSync<ICategory>(
		select_categories_for_transaction,
		[transactionId],
	);

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
	const { navigate } = useScreen();
	const { fetchSource } = useDatabase();
	const source = fetchSource(sourceId);
	return (
		<DataTabWrapper>
			<CustomText text={destination ? "Destination" : "Source"} />
			<TouchableOpacity onPress={() => navigate(sourceRoutes.detail)}>
				<CustomText text={source.name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

const Investment = ({ investmentId }: { investmentId?: string }) => {
	if (!investmentId) return;
	const { navigate } = useScreen();
	const { fetchInvestment } = useDatabase();
	const investment = fetchInvestment(investmentId);
	return (
		<DataTabWrapper>
			<CustomText text={"Investment"} />
			<TouchableOpacity onPress={() => navigate(investmentRoutes.detail)}>
				<CustomText text={investment.name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

const select_categories_for_transaction = `
	SELECT c.* 
	FROM "category" c
	JOIN "transaction_category" tc ON c.id = tc.categoryId
	WHERE tc.transactionId = ?;
`;

const select_trips_for_transaction = `
	SELECT t.* 
	FROM "trip" t
	JOIN "transaction_trip" tt ON t.id = tt.tripId
	WHERE tt.transactionId = ?;
`;

export default TransactionDetail;
