import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { BACKGROUND_COLOR, PRIMARY_COLOR } from "../../config/colors.config";
import { CENTER, LOADER_SIZE } from "../../config/constants.config";
import { FLEX_ONE } from "../../config/constants.config";

const LoadingScreen = () => {
	return (
		<View style={styles.view}>
			<StatusBar backgroundColor={BACKGROUND_COLOR} />
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
