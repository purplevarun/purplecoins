import { SECONDARY_COLOR } from "../../../config/colors.config";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS,
	MARGIN,
	PADDING,
	SEVENTY_P,
	SPACE_BETWEEN
} from "../../../config/constants.config";
import { ITransaction } from "../../../util/database/DatabaseSchema";
import CustomText from "../../../components/CustomText";

const TransactionRenderItem = ({ item }: { item: ITransaction }) => {
	return <TouchableOpacity style={styles.outer}>
		<CustomText text={item.id} />
	</TouchableOpacity>;
};

const styles = StyleSheet.create({
	outer: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
		justifyContent: SPACE_BETWEEN
	},
	reason: { width: SEVENTY_P }
});

export default TransactionRenderItem;
