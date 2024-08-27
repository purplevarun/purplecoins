import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const App = () => {
	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<Text style={styles.text}>Hello World</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#15151c",
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		fontSize: 40,
		color: "#9899a7",
	},
});

export default App;
