import { useNavigation, useRoute } from "@react-navigation/native";
import IScreenType from "./IScreenType";
import IServiceName from "./IServiceName";

const useScreen = () => {
	const { name } = useRoute();
	const navigation = useNavigation<any>();
	const [serviceName, screenType] = name.split(".") as [
		IServiceName,
		IScreenType,
	];
	const navigate = (screenName: string, id?: string) => {
		navigation.navigate(screenName, { id });
	};
	return { serviceName, screenType, navigate };
};

export default useScreen;
