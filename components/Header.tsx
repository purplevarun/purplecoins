import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	backgroundColor,
	primaryColor,
	secondaryColor,
} from "../config/Colors";
import MyText from "./MyText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";
const Header = () => {
	return (
		<View style={styles.container}>
			<MyText text={app.expo.name} header />
			<TouchableOpacity>
				<FontAwesome5 name="bars" size={40} color={primaryColor} />
			</TouchableOpacity>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		backgroundColor: backgroundColor,
		height: 60,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingLeft: 10,
		paddingRight: 15,
		borderBottomWidth: 1,
		borderBottomColor: primaryColor,
	},
});
export default Header;
