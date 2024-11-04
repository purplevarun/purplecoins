import { RealmProvider } from "@realm/react";
import ProviderType from "../types/ProviderType";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";
import UserModel from "../models/UserModel";
import SourceModel from "../models/SourceModel";
import LoadingScreen from "../screens/other/LoadingScreen";
import InvestmentModel from "../models/InvestmentModel";

const DatabaseProvider = ({ children }: ProviderType) => {
	return (
		<RealmProvider
			schema={[
				UserModel,
				TransactionModel,
				CategoryModel,
				SourceModel,
				InvestmentModel,
			]}
			deleteRealmIfMigrationNeeded
			fallback={<LoadingScreen />}
		>
			{children}
		</RealmProvider>
	);
};

export default DatabaseProvider;
