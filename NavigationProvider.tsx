import IProvider from "./IProvider";
import { NavigationContainer } from "@react-navigation/native";
import LoadingScreen from "./LoadingScreen";

const NavigationProvider: IProvider = ({ children }) => {
	return (
		<NavigationContainer fallback={<LoadingScreen />}>
			{children}
		</NavigationContainer>
	);
};

export default NavigationProvider;
