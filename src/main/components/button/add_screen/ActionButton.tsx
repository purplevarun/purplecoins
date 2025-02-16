import { DimensionValue, TouchableOpacity } from "react-native";
import {
	GREEN_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "../../../constants/config/colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FONT_SIZE,
} from "../../../constants/config/constants.config";
import TransactionAction from "../../../constants/enums/TransactionAction";
import CustomText from "../../text/CustomText";

const ActionButton = ({
	action,
	setAction,
	width,
}: {
	action: TransactionAction;
	setAction: (val: TransactionAction) => void;
	width: DimensionValue;
}) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor:
					action === TransactionAction.DEBIT
						? RED_COLOR
						: GREEN_COLOR,
				width,
				borderRadius: BORDER_RADIUS,
				height: FONT_SIZE * 2.5,
				alignSelf: "flex-end",
				justifyContent: CENTER,
				borderWidth: BORDER_WIDTH,
				borderColor: PRIMARY_COLOR,
			}}
			onPress={() =>
				setAction(
					action === TransactionAction.DEBIT
						? TransactionAction.CREDIT
						: TransactionAction.DEBIT,
				)
			}
		>
			<CustomText text={action} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default ActionButton;
