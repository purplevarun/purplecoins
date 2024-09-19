import { RealmProvider } from "@realm/react";
import Provider from "../types/Provider";
import Transaction from "../models/Transaction";

const DatabaseProvider: Provider = ({ children }) => {
	return <RealmProvider schema={[Transaction]}>{children}</RealmProvider>;
};
export default DatabaseProvider;
