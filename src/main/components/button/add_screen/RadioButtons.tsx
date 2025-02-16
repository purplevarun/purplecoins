import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	BORDER_WIDTH,
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	PADDING,
	SMALL_FONT_SIZE,
	SPACE_EVENLY,
} from "../../../constants/config/constants.config";
import CustomText from "../../text/CustomText";

interface IRadioGroup {
	onPress: (selectedId: string) => void;
	data: {
		id: string;
		label: string;
		color: string;
		value: string;
	}[];
	selectedId?: string;
}

interface IRadioButton {
	id: string;
	label: string;
	onPress: (id: string) => void;
	color: string;
	selected?: boolean;
}

interface IRadioIcon {
	color: string;
	selected?: boolean;
}

const RadioButtons = ({ onPress, data, selectedId }: IRadioGroup) => (
	<View style={styles.container}>
		{data.map(({ color, id, label }) => (
			<RadioButton
				key={id}
				color={color}
				id={id}
				label={label}
				selected={id === selectedId}
				onPress={() => id !== selectedId && onPress(id)}
			/>
		))}
	</View>
);

const RadioButton = ({
	color,
	id,
	label,
	onPress,
	selected = false,
}: IRadioButton) => (
	<TouchableOpacity onPress={() => onPress(id)} style={styles.button}>
		<CustomText text={label} fontSize={SMALL_FONT_SIZE} />
		<RadioIcon color={color} selected={selected} />
	</TouchableOpacity>
);

const RadioIcon = ({ color, selected }: IRadioIcon) => (
	<View style={[styles.icon, { borderColor: color }]}>
		{selected && (
			<View style={[styles.selected, { backgroundColor: color }]} />
		)}
	</View>
);

const styles = StyleSheet.create({
	container: {
		paddingVertical: PADDING / 2,
		alignSelf: CENTER,
		justifyContent: SPACE_EVENLY,
		width: "100%",
		flexDirection: FLEX_ROW,
		alignItems: CENTER,
	},
	button: {
		alignItems: CENTER,
		marginHorizontal: FONT_SIZE / 2,
		gap: FONT_SIZE / 3,
		flexDirection: FLEX_ROW,
	},
	icon: {
		justifyContent: CENTER,
		alignItems: CENTER,
		borderWidth: BORDER_WIDTH,
		width: FONT_SIZE,
		height: FONT_SIZE,
		borderRadius: FONT_SIZE / 2,
	},
	selected: {
		width: FONT_SIZE / 2,
		height: FONT_SIZE / 2,
		borderRadius: FONT_SIZE / 2,
	},
});

export default RadioButtons;
