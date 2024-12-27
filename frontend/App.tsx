import "react-native-gesture-handler";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "react-native";
import { BACKGROUND_COLOR } from "./config/colors.config";
import AuthScreen from "./AuthScreen";
import FontProvider from "./FontProvider";
import DatabaseProvider from "./DatabaseProvider";
import NavigationProvider from "./NavigationProvider";

const App = () => {
	NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	return (
		<FontProvider>
			<DatabaseProvider>
				<NavigationProvider>
					<StatusBar backgroundColor={BACKGROUND_COLOR} />
					<AuthScreen />
				</NavigationProvider>
			</DatabaseProvider>
		</FontProvider>
	);
};

// noinspection JSUnusedGlobalSymbols
export default App;
