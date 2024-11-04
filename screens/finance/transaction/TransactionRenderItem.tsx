import { SECONDARY_COLOR } from "../../../config/colors.config";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
	SEVENTY_P,
	CENTER,
} from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import TransactionModel from "../../../models/TransactionModel";
import SourceModel from "../../../models/SourceModel";
import { Results } from "realm";
import CategoryModel from "../../../models/CategoryModel";
import InvestmentModel from "../../../models/InvestmentModel";

const TransactionRenderItem = ({
	item,
	sourceModels,
	categoryModels,
	investmentModels,
}: {
	item: TransactionModel;
	sourceModels: Results<SourceModel>;
	categoryModels: Results<CategoryModel>;
	investmentModels: Results<InvestmentModel>;
}) => {
	const sourceName = sourceModels.filter((s) => s.id === item.sourceId)[0]
		.name;
	return (
		<TouchableOpacity style={styles.outer}>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
				}}
			>
				<CustomText text={"Amount"} />
				<CustomText text={item.amount} />
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
				<CustomText text={sourceName} />
			</View>
			{item.categories && item.categories.length > 0 && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						justifyContent: SPACE_BETWEEN,
					}}
				>
					<CustomText text={"Categories"} alignSelf={CENTER} />
					<View>
						{categoryModels
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
							investmentModels.filter(
								(i) => i.id === item.investmentId,
							)[0].name
						}
					/>
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
