import { useRoute } from "@react-navigation/native";
import ScreenType from "./ScreenType";
import Service from "./Service";

const useScreen = () => {
	const { name } = useRoute();
	const [serviceName, screenType] = name.split(".") as [Service, ScreenType];
	return { serviceName, screenType };
};

export default useScreen;
