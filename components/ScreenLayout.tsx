import { StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR } from "../config/colors.config";
import { FLEX, PADDING } from "../config/dimensions.config";
import Provider from "../types/Provider";

const ScreenLayout: Provider = ({ children }) => {
	return <View style={styles.container}>{children}</View>;
};
const styles = StyleSheet.create({
	container: {
		flex: FLEX,
		backgroundColor: BACKGROUND_COLOR,
		paddingHorizontal: PADDING,
	},
});
export default ScreenLayout;
