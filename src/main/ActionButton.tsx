import { DimensionValue, StyleSheet, TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import TransactionAction from "./TransactionAction";
import { GREEN_COLOR, PRIMARY_COLOR, RED_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FLEX_END,
	FONT_SIZE,
} from "./constants.config";

const ActionButton = ({
	action,
	setAction,
	width,
}: {
	action: TransactionAction;
	setAction: (_: TransactionAction) => void;
	width: DimensionValue;
}) => {
	const backgroundColor =
		action === TransactionAction.DEBIT ? RED_COLOR : GREEN_COLOR;
	const styles = StyleSheet.create({
		button: {
			backgroundColor,
			width,
			borderRadius: BORDER_RADIUS,
			height: FONT_SIZE * 2.5,
			alignSelf: FLEX_END,
			justifyContent: CENTER,
			borderWidth: BORDER_WIDTH,
			borderColor: PRIMARY_COLOR,
		},
	});

	const handlePress = () =>
		setAction(
			action === TransactionAction.DEBIT
				? TransactionAction.CREDIT
				: TransactionAction.DEBIT,
		);
	return (
		<TouchableOpacity style={styles.button} onPress={handlePress}>
			<CustomText text={action} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default ActionButton;
