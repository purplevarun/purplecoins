import { StyleSheet, TouchableOpacity, View } from "react-native";
import { headerColor, primaryColor } from "../config/Colors";
import {
	HEADER_HEIGHT,
	HEADER_ICON_SIZE as HEADER_FONT_SIZE,
	padding,
} from "../config/Constants";
import MyText from "./MyText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";

const Header = () => {
	return (
		<View style={styles.container}>
			<MyText text={app.expo.name} fontSize={HEADER_FONT_SIZE} />
			<TouchableOpacity>
				<FontAwesome5
					name="user-alt"
					size={HEADER_FONT_SIZE}
					color={primaryColor}
				/>
			</TouchableOpacity>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		backgroundColor: headerColor,
		height: HEADER_HEIGHT,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: padding,
	},
});
export default Header;
