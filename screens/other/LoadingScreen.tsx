import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../../config/colors.config";
import { LOADER_SIZE } from "../../config/dimensions.config";
import { FLEX } from "../../config/dimensions.config";

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
		flex: FLEX,
		backgroundColor: SECONDARY_COLOR,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default LoadingScreen;
