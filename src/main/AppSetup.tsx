import { NavigationContainer } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar, View } from "react-native";
import "react-native-gesture-handler";
import CustomFontSetup from "./CustomFontSetup";
import DatabaseSetup from "./DatabaseSetup";
import IProvider from "./IProvider";
import LoadingScreen from "./LoadingScreen";
import { BACKGROUND_COLOR } from "./colors.config";
import { FLEX_ONE } from "./constants.config";

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
