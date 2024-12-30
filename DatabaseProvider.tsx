import IProvider from "./IProvider";
import { Suspense } from "react";
import LoadingScreen from "./LoadingScreen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { DB_NAME } from "./constants.config";
import { create_queries } from "./queries.config";

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

export default DatabaseProvider;
