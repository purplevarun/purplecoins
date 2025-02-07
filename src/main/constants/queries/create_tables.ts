const create_source = `
CREATE TABLE IF NOT EXISTS "source" (
	id 			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const create_category = `
CREATE TABLE IF NOT EXISTS "category" (
	id   		TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const create_trip = `
CREATE TABLE IF NOT EXISTS "trip" (
	id			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const create_investment = `
CREATE TABLE IF NOT EXISTS "investment" (
	id 			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL
);`;

const create_transaction = `
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

const create_transaction_trip = `
CREATE TABLE IF NOT EXISTS "transaction_trip" (
	transactionId 	TEXT NOT NULL,
	tripId 			TEXT NOT NULL,
	PRIMARY KEY (transactionId, tripId),
	FOREIGN KEY (transactionId) REFERENCES "transaction" (id),
	FOREIGN KEY (tripId) REFERENCES "trip" (id)
);`;

const create_transaction_category = `
CREATE TABLE IF NOT EXISTS "transaction_category" (
	transactionId 	TEXT NOT NULL,
	categoryId 		TEXT NOT NULL,
	PRIMARY KEY (transactionId, categoryId),
	FOREIGN KEY (transactionId) REFERENCES "transaction" (id),
	FOREIGN KEY (categoryId) REFERENCES "category" (id)
);`;

const new_create_transaction = `
CREATE TABLE IF NOT EXISTS "transaction" (
	id              TEXT PRIMARY KEY,
	amount 			INTEGER NOT NULL CHECK (amount > 0),
	reason          TEXT NOT NULL,
	type            TEXT NOT NULL CHECK (type IN ('GENERAL', 'TRANSFER', 'INVESTMENT')),
	action          TEXT NOT NULL CHECK (action IN ('DEBIT', 'CREDIT')),
	date            DATE NOT NULL
);`;

const new_create_relation = `
CREATE TABLE IF NOT EXISTS "relation" (
	id			TEXT PRIMARY KEY,
	name 		TEXT NOT NULL,
	type		TEXT NOT NULL CHECK (type IN ('SOURCE', 'CATEGORY', 'TRIP', 'INVESTMENT')),
);`;

const new_create_transaction_relation = `
CREATE TABLE IF NOT EXISTS "transaction_relation" (
	transaction_id 	TEXT NOT NULL,
	relation_id 	TEXT NOT NULL,
	type			TEXT NOT NULL CHECK (type IN ('TRANSACTION_SOURCE', 'TRANSACTION_CATEGORY', 'TRANSACTION_TRIP', 'TRANSACTION_INVESTMENT', 'TRANSACTION_DESTINATION')),
	PRIMARY KEY (transaction_id, relation_id),
	FOREIGN KEY (transaction_id) REFERENCES "transaction" (id),
	FOREIGN KEY (relation_id) REFERENCES "relation" (id)
);`;

const create_tables = [
	create_source,
	create_category,
	create_trip,
	create_investment,
	create_transaction,
	create_transaction_trip,
	create_transaction_category,
];

export default create_tables;
