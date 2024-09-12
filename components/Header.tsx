import { StyleSheet, TouchableOpacity, View } from "react-native";
import { headerColor, primaryColor } from "../config/Colors";
import {
	FONT_SIZE,
	HEADER_HEIGHT,
	HEADER_ICON_SIZE,
	padding,
	SCREEN_HEIGHT,
} from "../config/Constants";
import MyText from "./MyText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";

const Header = () => {
	return (
		<View style={styles.container}>
			<MyText text={app.expo.name} header />
			<TouchableOpacity>
				<FontAwesome5
					name="user-alt"
					size={HEADER_ICON_SIZE}
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
