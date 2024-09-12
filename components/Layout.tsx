import { StyleSheet, View } from "react-native";
import { backgroundColor } from "../config/Colors";
import { flex, FONT_SIZE, padding } from "../config/Constants";
import ILayout from "../types/ILayout";

const Layout = ({ children }: ILayout) => {
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
