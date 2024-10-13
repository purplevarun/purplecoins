import { RealmProvider } from "@realm/react";
import Provider from "../types/Provider";
import TransactionModel from "../models/TransactionModel";

const DatabaseProvider: Provider = ({ children }) => {
	return (
		<RealmProvider schema={[TransactionModel]}>{children}</RealmProvider>
	);
};

export default DatabaseProvider;
