import "react-native-gesture-handler";
import * as NavigationBar from "expo-navigation-bar";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { Suspense, useCallback } from "react";
import { StatusBar } from "react-native";
import { BACKGROUND_COLOR } from "./colors.config";
import { useFonts } from "expo-font";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { create_queries } from "./queries.config";
import { DB_NAME } from "./constants.config";
import useAppStore from "./AppStore";
import Router from "./Router";
import LoggedOutScreen from "./LoggedOutScreen";
import useService from "./useService";
import LoadingScreen from "./LoadingScreen";
import IProvider from "./IProvider";

const Main = () => {
	const { isReRendering } = useAppStore();
	const { user } = useService();
	useFocusEffect(useCallback(() => {}, [isReRendering]));
	return user !== null ? <Router /> : <LoggedOutScreen />;
};

const App = () => {
	NavigationBar.setBackgroundColorAsync(BACKGROUND_COLOR).catch();
	return (
		<FontProvider>
			<DatabaseProvider>
				<NavigationProvider>
					<StatusBar backgroundColor={BACKGROUND_COLOR} />
					<Main />
				</NavigationProvider>
			</DatabaseProvider>
		</FontProvider>
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
