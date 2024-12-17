import { StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR } from "../config/colors.config";
import { FLEX_ONE, PADDING } from "../config/constants.config";
import IProvider from "../interfaces/IProvider";

const ScreenLayout: IProvider = ({ children }) => {
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
