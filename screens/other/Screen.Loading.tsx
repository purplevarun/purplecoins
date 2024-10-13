import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { primaryColor, secondaryColor } from "../../config/colors.config";
import { LOADER_SIZE } from "../../config/dimensions.config";
import { flex } from "../../config/style.config";

const ScreenLoading = () => {
	return (
		<View style={styles.view}>
			<StatusBar backgroundColor={secondaryColor} />
			<ActivityIndicator color={primaryColor} size={LOADER_SIZE} />
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		flex,
		backgroundColor: secondaryColor,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default ScreenLoading;
