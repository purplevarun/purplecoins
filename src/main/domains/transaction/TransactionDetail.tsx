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
import LinkedRelation from "../../models/LinkedRelation";
import { convertDateToString, formatMoney } from "../../util/HelperFunctions";

const TransactionDetail = ({ route }: any) => {
	const transactionId = route.params.id;
	const navigate = useScreen();
	const {
		fetchTransaction,
		deleteTransaction,
		fetchRelationsForTransaction,
	} = useDatabase();
	const transaction = fetchTransaction(transactionId);
	const relations = fetchRelationsForTransaction(transactionId);
	return (
		<ScreenLayout>
			<Header
				handleClose={() => navigate(transactionRoutes.main)}
				handleEdit={() =>
					navigate(transactionRoutes.edit, { id: transactionId })
				}
				handleDelete={() => {
					deleteTransaction(transactionId);
					navigate(sourceRoutes.main);
				}}
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
			<Source source={relations.TRANSACTION_SOURCE[0]} />
			{relations.TRANSACTION_DESTINATION && (
				<Destination
					destination={relations.TRANSACTION_DESTINATION[0]}
				/>
			)}
			{relations.TRANSACTION_INVESTMENT && (
				<Investment investment={relations.TRANSACTION_INVESTMENT[0]} />
			)}
			{relations.TRANSACTION_CATEGORY && (
				<Categories relations={relations.TRANSACTION_CATEGORY} />
			)}
			{relations.TRANSACTION_TRIP && (
				<Trips relations={relations.TRANSACTION_TRIP} />
			)}
		</ScreenLayout>
	);
};

const Trips = ({ relations }: { relations: LinkedRelation[] }) => {
	const navigate = useScreen();
	if (relations.length === 0) return null;
	return (
		<DataTabWrapper>
			<CustomText text={"Trips"} />
			<View style={styles.multiData}>
				{relations.map((trip) => {
					const onPress = () =>
						navigate(tripRoutes.detail, { id: trip.id });
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

const Categories = ({ relations }: { relations: LinkedRelation[] }) => {
	const navigate = useScreen();
	if (relations.length === 0) return null;
	return (
		<DataTabWrapper>
			<CustomText text={"Categories"} />
			<View style={styles.multiData}>
				{relations.map((category) => {
					const onPress = () =>
						navigate(categoryRoutes.detail, { id: category.id });
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

const Source = ({ source: { id, name } }: { source: LinkedRelation }) => {
	const navigate = useScreen();
	return (
		<DataTabWrapper>
			<CustomText text={"Source"} />
			<TouchableOpacity
				onPress={() => navigate(sourceRoutes.detail, { id })}
			>
				<CustomText text={name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

const Destination = ({
	destination: { id, name },
}: {
	destination: LinkedRelation;
}) => {
	const navigate = useScreen();
	return (
		<DataTabWrapper>
			<CustomText text={"Destination"} />
			<TouchableOpacity
				onPress={() => navigate(sourceRoutes.detail, { id })}
			>
				<CustomText text={name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

const Investment = ({
	investment: { id, name },
}: {
	investment: LinkedRelation;
}) => {
	const navigate = useScreen();
	return (
		<DataTabWrapper>
			<CustomText text={"Investment"} />
			<TouchableOpacity
				onPress={() => navigate(investmentRoutes.detail, { id })}
			>
				<CustomText text={name} decoration={"underline"} />
			</TouchableOpacity>
		</DataTabWrapper>
	);
};

export default TransactionDetail;
