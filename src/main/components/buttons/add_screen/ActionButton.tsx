import { DimensionValue, TouchableOpacity } from "react-native";
import CustomText from "../../../../../CustomText";
import {
	GREEN_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
} from "../../../../../colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
} from "../../../../../constants.config";
import Action from "../../../constants/enums/Action";

const ActionButton = ({
	action,
	setAction,
	width,
}: {
	action: Action;
	setAction: (val: Action) => void;
	width: DimensionValue;
}) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor:
					action === Action.DEBIT ? RED_COLOR : GREEN_COLOR,
				width,
				borderRadius: BORDER_RADIUS,
				height: FONT_SIZE * 2.5,
				alignSelf: "flex-end",
				justifyContent: CENTER,
				borderWidth: 2,
				borderColor: PRIMARY_COLOR,
			}}
			onPress={() =>
				setAction(
					action === Action.DEBIT ? Action.CREDIT : Action.DEBIT,
				)
			}
		>
			<CustomText text={action} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default ActionButton;
