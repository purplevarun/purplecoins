import "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { secondaryColor } from "./config/Colors";
import Configuration from "./config/Configuration";
import AppRouter from "./router/Router";
import Header from "./components/Header";
import { flex } from "./config/Constants";

const App = () => {
	return (
		<SafeAreaView style={styles.container}>
			<Configuration>
				<Header />
				<AppRouter />
			</Configuration>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex,
		backgroundColor: secondaryColor,
	},
});

export default App;
