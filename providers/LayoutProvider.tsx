import "react-native-gesture-handler";
import { SECONDARY_COLOR } from "../config/colors.config";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { FLEX_ONE } from "../config/constants.config";
import ProviderType from "../types/ProviderType";

const LayoutProvider = ({ children }: ProviderType) => {
	return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
	container: {
		flex: FLEX_ONE,
		backgroundColor: SECONDARY_COLOR,
	},
});

export default LayoutProvider;
