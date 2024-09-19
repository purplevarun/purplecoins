import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { headerColor, secondaryColor } from "../config/Colors";
import { NavigationContainer } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import FontNotLoadedScreen from "../screens/other/FontNotLoadedScreen";
import LoadingScreen from "../screens/other/LoadingScreen";
import Provider from "../types/Provider";

const FontProvider: Provider = ({ children }) => {
	NavigationBar.setBackgroundColorAsync(secondaryColor);
	const [loaded, error] = useFonts({
		Ubuntu: require("./../assets/fonts/Ubuntu-Regular.ttf"),
	});
	if (error) return <FontNotLoadedScreen />;
	if (!loaded) return <LoadingScreen />;
	return (
		<NavigationContainer>
			<StatusBar backgroundColor={headerColor} />
			{children}
		</NavigationContainer>
	);
};
export default FontProvider;
