import { create_queries } from "./config/queries.config";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { Suspense } from "react";
import { SQLiteProvider } from "expo-sqlite";
import { DB_NAME } from "./config/constants.config";
import AppRouter from "./screens/auth/AppRouter";
import IProvider from "./interfaces/IProvider";
import ErrorScreen from "./screens/other/ErrorScreen";
import LoadingScreen from "./screens/other/LoadingScreen";

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
	return <NavigationContainer fallback={<LoadingScreen />}>
		{children}
	</NavigationContainer>;
};

const FontProvider: IProvider = ({ children }) => {
	const fontSource = "./assets/fonts/Ubuntu-Regular.ttf";
	const [loaded, error] = useFonts({ Ubuntu: require(fontSource) });
	if (error) return <ErrorScreen message={"Font not loaded"} />;
	if (!loaded) return <LoadingScreen />;
	return children;
};

const DatabaseProvider: IProvider = ({ children }) => {
	return (
		<Suspense fallback={<LoadingScreen />}>
			<SQLiteProvider
				databaseName={DB_NAME}
				useSuspense
				onInit={async db => create_queries.forEach(query => db.runSync(query))}
			>
				{children}
			</SQLiteProvider>
		</Suspense>
	);
};

// noinspection JSUnusedGlobalSymbols
export default App;
