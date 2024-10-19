import { StatusBar, View, Text, StyleSheet } from "react-native";
import { SECONDARY_COLOR } from "../../config/colors.config";
import { FLEX } from "../../config/dimensions.config";

const ErrorScreen = ({ message }: { message: string }) => {
	return (
		<View style={styles.view}>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			<Text>{message}</Text>
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

export default ErrorScreen;
