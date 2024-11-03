import { RealmProvider } from "@realm/react";
import ProviderType from "../types/ProviderType";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";
import UserModel from "../models/UserModel";
import SourceModel from "../models/SourceModel";
import LoadingScreen from "../screens/other/LoadingScreen";

const DatabaseProvider = ({ children }: ProviderType) => {
	return (
		<RealmProvider
			schema={[UserModel, TransactionModel, CategoryModel, SourceModel]}
			deleteRealmIfMigrationNeeded
			fallback={<LoadingScreen />}
		>
			{children}
		</RealmProvider>
	);
};

export default DatabaseProvider;
