import { StyleSheet, TouchableOpacity, View } from "react-native";
import { primaryColor, secondaryColor } from "../config/Colors";
import MyText from "./MyText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const Header = () => {
	return (
		<View style={styles.container}>
			<MyText text="tudu" header />
			<TouchableOpacity>
				<FontAwesome5 name="user-alt" size={30} color={primaryColor} />
			</TouchableOpacity>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		backgroundColor: secondaryColor,
		height: 50,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingLeft: 10,
		paddingRight: 15,
	},
});
export default Header;
