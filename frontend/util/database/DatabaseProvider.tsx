import { DB_NAME } from "../../config/constants.config";
import { Suspense } from "react";
import { SQLiteProvider } from "expo-sqlite";
import LoadingScreen from "../../screens/other/LoadingScreen";
import IProvider from "../../interfaces/IProvider";

const DatabaseProvider: IProvider = ({ children }) => {
	return (
		<Suspense fallback={<LoadingScreen />}>
			<SQLiteProvider databaseName={DB_NAME} useSuspense>
				{children}
			</SQLiteProvider>
		</Suspense>
	);
};

export default DatabaseProvider;