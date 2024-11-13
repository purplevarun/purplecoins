import { ABSOLUTE, FONT_SIZE, PADDING } from "../config/constants.config";
import { RED_COLOR } from "../config/colors.config";
import { CLOSE_ICON } from "../config/icons.config";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const CloseButton = ({ path }: { path: string }) => {
	const { navigate } = useNavigation<any>();
	return (
		<View>
			<TouchableOpacity
				style={styles.button}
				onPress={() => navigate(path)}
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
