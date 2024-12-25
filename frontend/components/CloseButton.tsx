import { ABSOLUTE, FONT_SIZE, PADDING } from "../config/constants.config";
import { RED_COLOR } from "../config/colors.config";
import { CLOSE_ICON } from "../config/icons.config";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FC } from "react";

type ICloseButton = FC<{
	onPress?: () => void;
}>;

const MockedFn = () => {};

const CloseButton: ICloseButton = ({ onPress = MockedFn }) => {
	const { goBack } = useNavigation<any>();
	return (
		<View>
			<TouchableOpacity
				style={styles.button}
				onPress={() => {
					goBack();
					onPress();
				}}
				testID={"closeIcon"}
			>
				<FontAwesome
					name={CLOSE_ICON}
					size={FONT_SIZE * 2}
					color={RED_COLOR}
				/>
			</TouchableOpacity>
			<View style={styles.buffer} />
		</View>
	);
};

const styles = StyleSheet.create({
	button: {
		position: ABSOLUTE,
		top: PADDING * 1.2,
	},
	buffer: {
		paddingTop: PADDING,
	},
});

export default CloseButton;
