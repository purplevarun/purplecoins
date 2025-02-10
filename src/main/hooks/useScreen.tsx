import { useNavigation } from "@react-navigation/native";

const useScreen = () => {
	const { navigate } = useNavigation<any>();
	return (name: string, params?: object): VoidFunction =>
		navigate(name, params);
};

export default useScreen;
