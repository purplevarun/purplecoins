import { StatusBar, View, Text, StyleSheet } from "react-native";
import { secondaryColor } from "../../../config/colors.config";
import { flex } from "../../../config/style.config";

const ScreenErrorFontsNotLoaded = () => {
	return (
		<View style={styles.view}>
			<StatusBar backgroundColor={secondaryColor} />
			<Text>Font not loaded</Text>
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

export default ScreenErrorFontsNotLoaded;
