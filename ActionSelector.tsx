import { Switch, View } from "react-native";
import Action from "./Action";
import CustomText from "./CustomText";
import { GREEN_COLOR, PRIMARY_COLOR, RED_COLOR } from "./colors.config";
import { CENTER, FLEX_ROW, PADDING } from "./constants.config";

interface Props {
	action: Action;
	setAction: (val: Action) => void;
}

const ActionSelector = ({ action, setAction }: Props) => {
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				justifyContent: CENTER,
			}}
		>
			<CustomText text={"Credit"} alignSelf={CENTER} />
			<View style={{ width: PADDING }} />
			<Switch
				style={{ alignSelf: CENTER }}
				value={action === Action.DEBIT}
				onChange={() =>
					setAction(
						action === Action.CREDIT ? Action.DEBIT : Action.CREDIT,
					)
				}
				thumbColor={PRIMARY_COLOR}
				trackColor={{ true: RED_COLOR, false: GREEN_COLOR }}
			/>
			<View style={{ width: PADDING }} />
			<CustomText text={"Debit"} alignSelf={CENTER} />
		</View>
	);
};

export default ActionSelector;
