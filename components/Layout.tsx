import { StyleSheet, View } from "react-native";
import { backgroundColor } from "../config/Colors";
import ILayout from "../types/ILayout";

const Layout = ({ children }: ILayout) => {
	return <View style={styles.container}>{children}</View>;
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: backgroundColor,
	},
});
export default Layout;
