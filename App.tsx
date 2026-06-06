import { StyleSheet, Text, View } from "react-native";
import { version } from "./package.json";

const App = () => (
	<View style={styles.container}>
		<Text>Hello World!</Text>
		<Text>App version : {version}</Text>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});

export default App;
