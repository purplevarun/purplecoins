import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR } from "../../constants/config/colors.config";
import { FLEX_ONE, PADDING } from "../../constants/config/constants.config";
import LoadingScreen from "../../screens/loading/LoadingScreen";

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
		paddingHorizontal: PADDING / 2,
	},
});
export default ScreenLayout;
