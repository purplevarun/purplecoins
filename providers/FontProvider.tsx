import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { SECONDARY_COLOR } from "../config/colors.config";
import { NavigationContainer } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import ErrorScreen from "../screens/other/ErrorScreen";
import LoadingScreen from "../screens/other/LoadingScreen";
import Provider from "../types/Provider";

const FontProvider: Provider = ({ children }) => {
	NavigationBar.setBackgroundColorAsync(SECONDARY_COLOR).catch((ex) =>
		console.error(ex),
	);
	const fontSource = "./../assets/fonts/Ubuntu-Regular.ttf";
	const [loaded, error] = useFonts({
		Ubuntu: require(fontSource),
	});

	if (error) return <ErrorScreen message={"Font not loaded"} />;
	if (!loaded) return <LoadingScreen />;
	return (
		<NavigationContainer>
			<StatusBar backgroundColor={SECONDARY_COLOR} />
			{children}
		</NavigationContainer>
	);
};

export default FontProvider;
