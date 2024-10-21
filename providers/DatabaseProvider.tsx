import { RealmProvider } from "@realm/react";
import ProviderType from "../types/ProviderType";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";

const DatabaseProvider: ProviderType = ({ children }) => {
	return (
		<RealmProvider schema={[TransactionModel, CategoryModel]}>
			{children}
		</RealmProvider>
	);
};

export default DatabaseProvider;
