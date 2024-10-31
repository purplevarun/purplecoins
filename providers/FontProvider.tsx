import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import ErrorScreen from "../screens/other/ErrorScreen";
import LoadingScreen from "../screens/other/LoadingScreen";
import ProviderType from "../types/ProviderType";

const FontProvider: ProviderType = ({ children }) => {
	const fontSource = "./../assets/fonts/Ubuntu-Regular.ttf";
	const [loaded, error] = useFonts({
		Ubuntu: require(fontSource),
	});

	if (error) return <ErrorScreen message={"Font not loaded"} />;
	if (!loaded) return <LoadingScreen />;
	return (
		<NavigationContainer fallback={<LoadingScreen />}>
			{children}
		</NavigationContainer>
	);
};

export default FontProvider;
