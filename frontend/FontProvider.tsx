import IProvider from "./interfaces/IProvider";
import { useFonts } from "expo-font";
import ErrorScreen from "./ErrorScreen";
import LoadingScreen from "./LoadingScreen";

const FontProvider: IProvider = ({ children }) => {
	const [loaded, error] = useFonts({
		Ubuntu: require("./assets/fonts/Ubuntu-Regular.ttf"),
	});
	if (error) return <ErrorScreen message={"Font not loaded"} />;
	if (!loaded) return <LoadingScreen />;
	return children;
};

export default FontProvider;
