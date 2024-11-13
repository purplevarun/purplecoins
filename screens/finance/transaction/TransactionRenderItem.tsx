import { SECONDARY_COLOR } from "../../../config/colors.config";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SEVENTY_P,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import TransactionModel from "../../../models/TransactionModel";
import useDatabase from "../../../util/DatabaseFunctions";
import { formatMoney } from "../../../util/HelperFunctions";

const TransactionRenderItem = ({ item }: { item: TransactionModel }) => {
	const { sources, investments, trips, categories } = useDatabase();
	return (
		<TouchableOpacity style={styles.outer}>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: CENTER,
				}}
			>
				<CustomText text={item.type} alignSelf={CENTER} />
			</View>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
				}}
			>
				<CustomText text={"Amount"} />
				<CustomText text={formatMoney(item.amount)} />
			</View>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
				}}
			>
				<CustomText text={"Reason"} />
				<CustomText text={item.reason} />
			</View>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
				}}
			>
				<CustomText text={"Source"} />
				<CustomText
					text={sources.filter((s) => s.id === item.sourceId)[0].name}
				/>
			</View>
			{item.destinationId && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						justifyContent: SPACE_BETWEEN,
					}}
				>
					<CustomText text={"Destination"} />
					<CustomText
						text={
							sources.filter(
								(s) => s.id === item.destinationId,
							)[0].name
						}
					/>
				</View>
			)}
			{item.categories && item.categories.length > 0 && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						justifyContent: SPACE_BETWEEN,
					}}
				>
					<CustomText text={"Categories"} alignSelf={CENTER} />
					<View>
						{categories
							.filter((c) => item.categories?.includes(c.id))
							.map((c) => (
								<CustomText text={c.name} key={c.id} />
							))}
					</View>
				</View>
			)}
			{item.investmentId && item.investmentId.length > 0 && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						justifyContent: SPACE_BETWEEN,
					}}
				>
					<CustomText text={"Investment"} />
					<CustomText
						text={
							investments.filter(
								(i) => i.id === item.investmentId,
							)[0].name
						}
					/>
				</View>
			)}
			{item.trips && item.trips.length > 0 && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						justifyContent: SPACE_BETWEEN,
					}}
				>
					<CustomText text={"Trips"} alignSelf={CENTER} />
					<View>
						{trips
							.filter((t) => item.trips?.includes(t.id))
							.map((t) => (
								<CustomText text={t.name} key={t.id} />
							))}
					</View>
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	outer: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
		justifyContent: SPACE_BETWEEN,
	},
	reason: { width: SEVENTY_P },
});

export default TransactionRenderItem;
