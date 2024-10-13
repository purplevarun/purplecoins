import "react-native-gesture-handler";
import { secondaryColor } from "../config/colors.config";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { flex } from "../config/style.config";
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
