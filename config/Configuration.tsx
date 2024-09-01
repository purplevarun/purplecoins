import { useFonts } from "expo-font";
import { StatusBar } from "react-native";
import { headerColor, secondaryColor } from "./Colors";
import { NavigationContainer } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import FontNotLoadedScreen from "../router/screens/other/FontNotLoadedScreen";
import LoadingScreen from "../router/screens/other/LoadingScreen";
import ILayout from "../types/ILayout";

const Configuration = ({ children }: ILayout) => {
	NavigationBar.setBackgroundColorAsync(secondaryColor);
	const [loaded, error] = useFonts({
		Fredoka: require("./../assets/fonts/fredoka.ttf"),
		Fredoka_One: require("./../assets/fonts/fredoka_one.ttf"),
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
export default Configuration;
