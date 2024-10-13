import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { headerColor, secondaryColor } from "../config/colors.config";
import { NavigationContainer } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import ScreenErrorFontsNotLoaded from "../screens/other/error/Screen.Error.FontsNotLoaded";
import ScreenLoading from "../screens/other/Screen.Loading";
import Provider from "../types/Provider";

const FontProvider: Provider = ({ children }) => {
	NavigationBar.setBackgroundColorAsync(secondaryColor).catch((ex) =>
		console.error(ex),
	);
	const fontSource = "./../assets/fonts/Ubuntu-Regular.ttf";
	const [loaded, error] = useFonts({
		Ubuntu: require(fontSource),
	});

	if (error) return <ScreenErrorFontsNotLoaded />;
	if (!loaded) return <ScreenLoading />;
	return (
		<NavigationContainer>
			<StatusBar backgroundColor={headerColor} />
			{children}
		</NavigationContainer>
	);
};

export default FontProvider;
