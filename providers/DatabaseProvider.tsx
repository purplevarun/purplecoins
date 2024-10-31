import { RealmProvider } from "@realm/react";
import ProviderType from "../types/ProviderType";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";
import UserModel from "../models/UserModel";

const DatabaseProvider: ProviderType = ({ children }) => {
	return (
		<RealmProvider schema={[UserModel, TransactionModel, CategoryModel]}>
			{children}
		</RealmProvider>
	);
};

export default DatabaseProvider;
