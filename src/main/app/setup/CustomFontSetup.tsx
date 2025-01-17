import { useFonts } from "expo-font";
import LoadingScreen from "../../components/LoadingScreen";
import IProvider from "../../types/IProvider";

const CustomFontSetup: IProvider = ({ children }) => {
	const [loaded, error] = useFonts({
		Ubuntu: require("../../../../assets/fonts/Ubuntu-Regular.ttf"),
	});
	if (error || !loaded) return <LoadingScreen />;
	return children;
};

export default CustomFontSetup;
