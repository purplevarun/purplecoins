const new_create_transaction = `
CREATE TABLE IF NOT EXISTS "transaction" (
	id              TEXT PRIMARY KEY NOT NULL,
	amount 			INTEGER NOT NULL CHECK (amount > 0),
	reason          TEXT NOT NULL,
	type            TEXT NOT NULL CHECK (type IN ('GENERAL', 'TRANSFER', 'INVESTMENT')),
	action          TEXT NOT NULL CHECK (action IN ('DEBIT', 'CREDIT')),
	date            DATE NOT NULL
);`;

const new_create_relation = `
CREATE TABLE IF NOT EXISTS "relation" (
	id			TEXT PRIMARY KEY NOT NULL,
	name 		TEXT NOT NULL,
	type		TEXT NOT NULL CHECK (type IN ('SOURCE', 'CATEGORY', 'TRIP', 'INVESTMENT'))
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
	new_create_transaction,
	new_create_relation,
	new_create_transaction_relation,
];

export default create_tables;
