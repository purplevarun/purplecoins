import { ActivityIndicator, StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR, PRIMARY_COLOR } from "./colors.config";
import { CENTER, FLEX_ONE, LOADER_SIZE } from "./constants.config";

const LoadingScreen = () => {
	return (
		<View style={styles.view}>
			<ActivityIndicator color={PRIMARY_COLOR} size={LOADER_SIZE} />
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		flex: FLEX_ONE,
		backgroundColor: BACKGROUND_COLOR,
		justifyContent: CENTER,
		alignItems: CENTER,
	},
});

export default LoadingScreen;
