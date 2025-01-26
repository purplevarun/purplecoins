import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { DB_NAME } from "../../constants/constants.config";
import IProvider from "../../types/IProvider";

const DatabaseSetup: IProvider = ({ children }) => {
	const handleInit = async (db: SQLiteDatabase) =>
		create_tables.forEach((query) => db.runSync(query));
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

const source = `
CREATE TABLE IF NOT EXISTS "source" (
	id 			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const category = `
CREATE TABLE IF NOT EXISTS "category" (
	id   		TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const trip = `
CREATE TABLE IF NOT EXISTS "trip" (
	id			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const investment = `
CREATE TABLE IF NOT EXISTS "investment" (
	id 			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const transaction = `
CREATE TABLE IF NOT EXISTS "transaction" (
	id              TEXT PRIMARY KEY,
	amount 			INTEGER NOT NULL CHECK (amount > 0),
	reason          TEXT NOT NULL,
	type            TEXT NOT NULL CHECK (type IN ('GENERAL', 'TRANSFER', 'INVESTMENT')),
	action          TEXT NOT NULL CHECK (action IN ('DEBIT', 'CREDIT')),
	date            DATE NOT NULL,
	sourceId        TEXT NOT NULL,
	destinationId   TEXT,
	investmentId    TEXT,
	FOREIGN KEY (sourceId) REFERENCES "source" (id),
	FOREIGN KEY (destinationId) REFERENCES "source" (id),
	FOREIGN KEY (investmentId) REFERENCES "investment" (id)
);`;

const transaction_trip = `
CREATE TABLE IF NOT EXISTS "transaction_trip" (
	transactionId 	TEXT NOT NULL,
	tripId 			TEXT NOT NULL,
	PRIMARY KEY (transactionId, tripId),
	FOREIGN KEY (transactionId) REFERENCES "transaction" (id),
	FOREIGN KEY (tripId) REFERENCES "trip" (id)
);`;

const transaction_category = `
CREATE TABLE IF NOT EXISTS "transaction_category" (
	transactionId 	TEXT NOT NULL,
	categoryId 		TEXT NOT NULL,
	PRIMARY KEY (transactionId, categoryId),
	FOREIGN KEY (transactionId) REFERENCES "transaction" (id),
	FOREIGN KEY (categoryId) REFERENCES "category" (id)
);`;

const create_tables = [
	source,
	category,
	trip,
	investment,
	transaction,
	transaction_trip,
	transaction_category,
];

export default DatabaseSetup;
