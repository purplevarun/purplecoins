import "react-native-gesture-handler";
import { SECONDARY_COLOR } from "../config/colors.config";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { FLEX } from "../config/dimensions.config";
import Provider from "../types/Provider";

const LayoutProvider: Provider = ({ children }) => {
	return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
	container: {
		flex: FLEX,
		backgroundColor: SECONDARY_COLOR,
	},
});

export default LayoutProvider;
