import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { DB_NAME } from "../../constants/constants.config";
import create_tables from "../../constants/queries/create_tables";
import IProvider from "../../types/IProvider";

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
