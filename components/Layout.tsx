import { StyleSheet, View } from "react-native";
import { backgroundColor } from "../config/Colors";
import { flex, padding } from "../config/Constants";
import Provider from "../types/Provider";

const Layout: Provider = ({ children }) => {
	return <View style={styles.container}>{children}</View>;
};
const styles = StyleSheet.create({
	container: {
		flex,
		backgroundColor: backgroundColor,
		paddingHorizontal: padding,
	},
});
export default Layout;
