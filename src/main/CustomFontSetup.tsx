import { useFonts } from "expo-font";
import IProvider from "./IProvider";
import LoadingScreen from "./LoadingScreen";

const CustomFontSetup: IProvider = ({ children }) => {
	const [loaded, error] = useFonts({
		Ubuntu: require("../../assets/fonts/Ubuntu-Regular.ttf"),
	});
	if (error || !loaded) return <LoadingScreen />;
	return children;
};

export default CustomFontSetup;
