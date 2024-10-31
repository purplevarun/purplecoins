import { RealmProvider } from "@realm/react";
import ProviderType from "../types/ProviderType";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";
import UserModel from "../models/UserModel";
import LoadingScreen from "../screens/other/LoadingScreen";

const DatabaseProvider: ProviderType = ({ children }) => {
	return (
		<RealmProvider
			schema={[UserModel, TransactionModel, CategoryModel]}
			deleteRealmIfMigrationNeeded
			fallback={<LoadingScreen />}
		>
			{children}
		</RealmProvider>
	);
};

export default DatabaseProvider;
