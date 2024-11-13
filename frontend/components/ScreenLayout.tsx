import { StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR } from "../config/colors.config";
import { FLEX_ONE, PADDING } from "../config/constants.config";
import ProviderType from "../types/ProviderType";

const ScreenLayout = ({ children }: ProviderType) => {
	return <View style={styles.container}>{children}</View>;
};
const styles = StyleSheet.create({
	container: {
		flex: FLEX_ONE,
		backgroundColor: BACKGROUND_COLOR,
		paddingHorizontal: PADDING,
	},
});
export default ScreenLayout;
