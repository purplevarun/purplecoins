import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../config/colors.config";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	SPACE_BETWEEN,
} from "../config/constants.config";
import { PADDING } from "../config/constants.config";
import CustomText from "./CustomText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";

const Header = () => {
	return (
		<View style={styles.container}>
			<CustomText text={app.expo.name} fontSize={LARGE_FONT_SIZE} />
			<TouchableOpacity>
				<FontAwesome5
					name="user-alt"
					size={LARGE_FONT_SIZE}
					color={PRIMARY_COLOR}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: SECONDARY_COLOR,
		height: HEADER_HEIGHT,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
		alignItems: CENTER,
		paddingHorizontal: PADDING,
	},
});

export default Header;
