import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import IProvider from "./IProvider";
import LoadingScreen from "./LoadingScreen";
import { DB_NAME } from "./constants.config";
import create_tables from "./create_tables";

const DatabaseSetup: IProvider = ({ children }) => {
	const handleInit = async (db: SQLiteDatabase) =>
		create_tables.forEach((q) => db.runSync(q));
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
export default DatabaseSetup;
