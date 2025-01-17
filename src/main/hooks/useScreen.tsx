import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenType from "../constants/enums/ScreenType";
import Service from "../constants/enums/Service";

const useScreen = () => {
	const { name } = useRoute();
	const navigation = useNavigation<any>();
	const [serviceName, screenType] = name.split(".") as [Service, ScreenType];
	const navigate = (screenName: string, id?: string) => {
		navigation.navigate(screenName, { id });
	};
	return { serviceName, screenType, navigate };
};

export default useScreen;
