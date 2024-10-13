import { StyleSheet, View } from "react-native";
import { backgroundColor } from "../config/colors.config";
import { flex, padding } from "../config/style.config";
import Provider from "../types/Provider";

const ComponentLayout: Provider = ({ children }) => {
	return <View style={styles.container}>{children}</View>;
};
const styles = StyleSheet.create({
	container: {
		flex,
		backgroundColor,
		paddingHorizontal: padding,
	},
});
export default ComponentLayout;
