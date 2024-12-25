import { StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR } from "../config/colors.config";
import { FLEX_ONE, PADDING } from "../config/constants.config";
import { ReactNode } from "react";
import LoadingScreen from "../LoadingScreen";

const ScreenLayout = ({
	children,
	loading = false,
}: {
	children: ReactNode;
	loading?: boolean;
}) => {
	if (loading) return <LoadingScreen />;
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
