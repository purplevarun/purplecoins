import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { Suspense } from "react";
import { SQLiteProvider } from "expo-sqlite";
import { DB_NAME } from "./config/constants.config";
import create_queries from "./config/create_queries.config";
import AppRouter from "./screens/auth/AppRouter";
import ErrorScreen from "./screens/other/ErrorScreen";
import LoadingScreen from "./screens/other/LoadingScreen";
import IProvider from "./interfaces/IProvider";

const App = () => {
	return (
		<FontProvider>
			<DatabaseProvider>
				<NavigationProvider>
					<AppRouter />
				</NavigationProvider>
			</DatabaseProvider>
		</FontProvider>
	);
};

const NavigationProvider: IProvider = ({ children }) => {
	return (
		<NavigationContainer fallback={<LoadingScreen />}>
			{children}
		</NavigationContainer>
	);
};

const FontProvider: IProvider = ({ children }) => {
	const [loaded, error] = useFonts({
		Ubuntu: require("./assets/fonts/Ubuntu-Regular.ttf"),
	});
	if (error) return <ErrorScreen message={"Font not loaded"} />;
	if (!loaded) return <LoadingScreen />;
	return children;
};

const DatabaseProvider: IProvider = ({ children }) => {
	return (
		<Suspense fallback={<LoadingScreen />}>
			<SQLiteProvider
				databaseName={DB_NAME}
				onInit={async (db) =>
					create_queries.forEach((query) => db.runSync(query))
				}
				useSuspense
			>
				{children}
			</SQLiteProvider>
		</Suspense>
	);
};

// noinspection JSUnusedGlobalSymbols
export default App;
