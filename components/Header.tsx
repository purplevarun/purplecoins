import { StyleSheet, TouchableOpacity, View } from "react-native";
import { headerColor, primaryColor } from "../config/Colors";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import MyText from "./MyText";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import app from "./../app.json";

const Header = () => {
	const { dispatch } = useNavigation();
	return (
		<View style={styles.container}>
			<MyText text={app.expo.name} size={30} header />
			<TouchableOpacity
				onPress={() => dispatch(DrawerActions.toggleDrawer())}
			>
				<FontAwesome5 name="bars" size={40} color={primaryColor} />
			</TouchableOpacity>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		backgroundColor: headerColor,
		height: 60,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingLeft: 10,
		paddingRight: 15,
	},
});
export default Header;
