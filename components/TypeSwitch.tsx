import { Switch, View } from "react-native";
import { PADDING } from "../config/constants.config";
import { GREEN_COLOR, PRIMARY_COLOR, RED_COLOR } from "../config/colors.config";
import CustomText from "./CustomText";

type Props = {
	value: boolean;
	setValue: (val: boolean) => void;
};
const TypeSwitch = ({ value, setValue }: Props) => {
	return (
		<View
			style={{
				alignItems: "center",
				padding: PADDING,
				paddingTop: PADDING * 2,
				flexDirection: "row",
				width: "100%",
				justifyContent: "space-evenly",
			}}
		>
			<CustomText text={"Expense"} />
			<Switch
				value={value}
				onChange={() => setValue(!value)}
				thumbColor={PRIMARY_COLOR}
				trackColor={{ false: RED_COLOR, true: GREEN_COLOR }}
				style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
			/>
			<CustomText text={"Income"} />
		</View>
	);
};

export default TypeSwitch;
