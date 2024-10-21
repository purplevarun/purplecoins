import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../../config/colors.config";
import { CENTER, LOADER_SIZE } from "../../config/constants.config";
import { FLEX_ONE } from "../../config/constants.config";

const LoadingScreen = () => {
	return (
		<View style={styles.view}>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			<ActivityIndicator color={PRIMARY_COLOR} size={LOADER_SIZE} />
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		flex: FLEX_ONE,
		backgroundColor: SECONDARY_COLOR,
		justifyContent: CENTER,
		alignItems: CENTER,
	},
});

export default LoadingScreen;
