import { StatusBar, View, Text, StyleSheet } from "react-native";
import { SECONDARY_COLOR } from "../../config/colors.config";
import { CENTER, FLEX_ONE } from "../../config/constants.config";

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
		flex: FLEX_ONE,
		backgroundColor: SECONDARY_COLOR,
		justifyContent: CENTER,
		alignItems: CENTER,
	},
});

export default ErrorScreen;
