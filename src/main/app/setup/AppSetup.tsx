import { NavigationContainer } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar, View } from "react-native";
import "react-native-gesture-handler";
import LoadingScreen from "../../components/LoadingScreen";
import { BACKGROUND_COLOR } from "../../constants/colors.config";
import { FLEX_ONE } from "../../constants/constants.config";
import IProvider from "../../types/IProvider";
import CustomFontSetup from "./CustomFontSetup";
import DatabaseSetup from "./DatabaseSetup";

const AppSetup: IProvider = ({ children }) => {
	SplashScreen.preventAutoHideAsync().catch();
	NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	return (
		<View style={{ flex: FLEX_ONE, backgroundColor: BACKGROUND_COLOR }}>
			<CustomFontSetup>
				<DatabaseSetup>
					<NavigationContainer fallback={<LoadingScreen />}>
						<StatusBar backgroundColor={BACKGROUND_COLOR} />
						{children}
					</NavigationContainer>
				</DatabaseSetup>
			</CustomFontSetup>
		</View>
	);
};

export default AppSetup;
