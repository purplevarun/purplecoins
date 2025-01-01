import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { StatusBar, View } from "react-native";
import "react-native-gesture-handler";
import IProvider from "./IProvider";
import LoadingScreen from "./LoadingScreen";
import Router from "./Router";
import { BACKGROUND_COLOR } from "./colors.config";
import { DB_NAME, FLEX_ONE } from "./constants.config";
import { create_queries } from "./queries.config";

const App = () => {
	NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	return (
		<View style={{ flex: FLEX_ONE, backgroundColor: BACKGROUND_COLOR }}>
			<FontProvider>
				<DatabaseProvider>
					<NavigationProvider>
						<StatusBar backgroundColor={BACKGROUND_COLOR} />
						<Router />
					</NavigationProvider>
				</DatabaseProvider>
			</FontProvider>
		</View>
	);
};

const FontProvider: IProvider = ({ children }) => {
	const [loaded, error] = useFonts({
		Ubuntu: require("./assets/fonts/Ubuntu-Regular.ttf"),
	});
	if (error || !loaded) return <LoadingScreen />;
	return children;
};

const DatabaseProvider: IProvider = ({ children }) => {
	const handleInit = async (db: SQLiteDatabase) => {
		create_queries.forEach((query) => db.runSync(query));
	};
	return (
		<Suspense fallback={<LoadingScreen />}>
			<SQLiteProvider
				databaseName={DB_NAME}
				onInit={handleInit}
				useSuspense
			>
				{children}
			</SQLiteProvider>
		</Suspense>
	);
};

const NavigationProvider: IProvider = ({ children }) => {
	return (
		<NavigationContainer fallback={<LoadingScreen />}>
			{children}
		</NavigationContainer>
	);
};

// noinspection JSUnusedGlobalSymbols
export default App;
