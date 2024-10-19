import { RealmProvider } from "@realm/react";
import Provider from "../types/Provider";
import TransactionModel from "../models/TransactionModel";
import CategoryModel from "../models/CategoryModel";

const DatabaseProvider: Provider = ({ children }) => {
	return (
		<RealmProvider schema={[TransactionModel, CategoryModel]}>
			{children}
		</RealmProvider>
	);
};

export default DatabaseProvider;
