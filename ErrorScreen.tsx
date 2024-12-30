import { View, Text, StyleSheet } from "react-native";
import { SECONDARY_COLOR } from "./colors.config";
import { CENTER, FLEX_ONE } from "./constants.config";

const ErrorScreen = ({ message }: { message: string }) => {
	return (
		<View style={styles.view}>
			<Text>{message}</Text>
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

export default ErrorScreen;
