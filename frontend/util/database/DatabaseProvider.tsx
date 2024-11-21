import { Suspense } from "react";
import { SQLiteProvider } from "expo-sqlite";
import LoadingScreen from "../../screens/other/LoadingScreen";
import ProviderType from "../../types/ProviderType";

const DatabaseProvider = ({ children }: ProviderType) => {
	return <Suspense fallback={<LoadingScreen />}>
		<SQLiteProvider databaseName={"purplecoins.db"} useSuspense>
			{children}
		</SQLiteProvider>
	</Suspense>;
};

export default DatabaseProvider;