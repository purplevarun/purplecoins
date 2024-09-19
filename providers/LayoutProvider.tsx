import "react-native-gesture-handler";
import { flex } from "../config/Constants";
import { secondaryColor } from "../config/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import Provider from "../types/Provider";

const LayoutProvider: Provider = ({ children }) => {
	return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};
const styles = StyleSheet.create({
	container: {
		flex,
		backgroundColor: secondaryColor,
	},
});
export default LayoutProvider;
