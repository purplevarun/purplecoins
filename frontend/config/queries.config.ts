export const FETCH_SOURCES = `
	SELECT * FROM source WHERE userId=?
`;

export const ADD_SOURCE = `
	INSERT INTO source 
		(id, userId, name, initialAmount, currentAmount)
	VALUES
		(?, ?, ?, ?, ?)
`;

const CREATE_USER = `
	CREATE TABLE IF NOT EXISTS user (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL
	);
`;

const CREATE_SOURCE = `
	CREATE TABLE IF NOT EXISTS source (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		initialAmount INTEGER NOT NULL,
		currentAmount INTEGER NOT NULL,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`;

const CREATE_CATEGORY = `
	CREATE TABLE IF NOT EXISTS category (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		type TEXT NOT NULL,
		monthlyBudget INTEGER,
		annualBudget INTEGER,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`;

const CREATE_INVESTMENT = `
	CREATE TABLE IF NOT EXISTS investment (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		investedAmount INTEGER NOT NULL,
		currentAmount INTEGER NOT NULL,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`;

const CREATE_TRIP = `
	CREATE TABLE IF NOT EXISTS trip (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		startDate DATETIME,
		endDate DATETIME,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`;

const CREATE_TRANSACTION = `
	CREATE TABLE IF NOT EXISTS transaction_record (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		sourceId TEXT NOT NULL,
		destinationId TEXT,
		investmentId TEXT,
		amount INTEGER NOT NULL,
		reason TEXT NOT NULL,
		type TEXT NOT NULL,
		date DATETIME NOT NULL,
		FOREIGN KEY (userId) REFERENCES user (id),
		FOREIGN KEY (sourceId) REFERENCES source (id),
		FOREIGN KEY (destinationId) REFERENCES source (id),
		FOREIGN KEY (investmentId) REFERENCES investment (id)
	);
`;

const CREATE_TRANSACTION_TRIP = `
	CREATE TABLE IF NOT EXISTS transaction_trip (
		transactionId TEXT NOT NULL,
		tripId TEXT NOT NULL,
		FOREIGN KEY (transactionId) REFERENCES transaction_record (id),
		FOREIGN KEY (tripId) REFERENCES trip (id),
		PRIMARY KEY (transactionId, tripId)
	);
`;

const CREATE_TRANSACTION_CATEGORY = `
	CREATE TABLE IF NOT EXISTS transaction_category (
		transactionId TEXT NOT NULL,
		categoryId TEXT NOT NULL,
		FOREIGN KEY (transactionId) REFERENCES transaction_record (id),
		FOREIGN KEY (categoryId) REFERENCES category (id),
		PRIMARY KEY (transactionId, categoryId)
	);
`;

export const create_queries = [
	CREATE_USER,
	CREATE_SOURCE,
	CREATE_CATEGORY,
	CREATE_INVESTMENT,
	CREATE_TRIP,
	CREATE_TRANSACTION,
	CREATE_TRANSACTION_TRIP,
	CREATE_TRANSACTION_CATEGORY
];