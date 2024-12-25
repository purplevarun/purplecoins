// single queries
export const fetch_all_trips = "SELECT t.* from trip t where userId=?";
export const delete_single_user = "DELETE FROM user;";
export const insert_user = "INSERT INTO user (id, name) VALUES (?, ?);";
export const select_all_users = "SELECT * from user;";
export const select_all_sources = "SELECT * FROM source WHERE userId=?;";
export const insert_source =
	"INSERT INTO source (id, userId, name, initialAmount, currentAmount) VALUES (?, ?, ?, ?, ?);";
export const fetch_transactions_for_category =
	"SELECT t.* FROM transaction_record t JOIN transaction_category tc ON t.id = tc.transactionId WHERE tc.categoryId = ?;";
export const insert_transaction = "INSERT INTO transaction_record (id,userId,sourceId,amount,reason,type,date,destinationId,investmentId) VALUES (?,?,?,?,?,?,?,?,?)";
export const update_source_amount = "UPDATE source SET currentAmount=currentAmount-? WHERE id=?";
export const update_destination_amount = "UPDATE source SET currentAmount=currentAmount+? WHERE id=?";
export const update_investment_amount = "UPDATE investment SET investedAmount=investedAmount+? WHERE id=?";
export const create_transaction_trip = "INSERT INTO transaction_trip (userId, transactionId, tripId) VALUES (?, ?, ?)";
export const create_transaction_category = "INSERT INTO transaction_category (userId, transactionId, categoryId) VALUES (?, ?, ?)";
export const insert_category = "INSERT INTO category (id, userId, name) VALUES (?, ?, ?)";
export const fetch_single_category = "SELECT * from category where id=?";
export const fetch_all_category = "SELECT * FROM category WHERE userId=?";
export const fetch_all_investments = "SELECT * from investment where userId=?";
export const insert_investment =
	"INSERT INTO investment (id, userId, name, investedAmount, currentAmount) VALUES (?, ?, ?, ?, ?)";
export const fetch_single_trip = "SELECT * FROM trip WHERE id = ?;";
export const delete_single_trip = "DELETE FROM trip WHERE id = ?;";
export const fetch_amount_for_trip =
	"SELECT sum(t.amount) as total FROM transaction_record t JOIN transaction_trip tt ON t.id = tt.transactionId WHERE tt.tripId = ?;";
export const fetch_transaction_for_trip =
	"SELECT t.* FROM transaction_record t JOIN transaction_trip tt ON t.id = tt.transactionId WHERE tt.tripId = ?;";
export const insert_trip_with_start_and_end_date =
	"INSERT INTO trip (id, userId, name, startDate, endDate) VALUES (?, ?, ?, ?, ?)";
export const insert_trip_with_start_date =
	"INSERT INTO trip (id, userId, name, startDate) VALUES (?, ?, ?, ?)";
export const insert_trip_without_date =
	"INSERT INTO trip (id, userId, name) VALUES (?, ?, ?)";
export const update_trip_with_start_and_end_date =
	"UPDATE trip SET name = ?, startDate = ?, endDate = ? WHERE id = ?";
export const update_trip_with_start_date =
	"UPDATE trip SET name = ?, startDate = ? WHERE id = ?";
export const update_trip_without_date = "UPDATE trip SET name = ? WHERE id = ?";
export const fetch_single_transaction = `
	SELECT 
		t.id,
		t.amount,
		t.reason,
		t.type,
		t.date,
		s.name AS source,
		d.name AS destination,
		i.name AS investment,
		u.name AS user,
			CASE 
			WHEN COUNT(c.id) > 0
			THEN
				JSON_GROUP_ARRAY(
					DISTINCT JSON_OBJECT(
						'name', c.name,
						'id', c.id
					)
				) 
			ELSE NULL 
			END
		AS categories,
			CASE 
			WHEN COUNT(trip.id) > 0
			THEN
				JSON_GROUP_ARRAY(
					DISTINCT JSON_OBJECT(
						'name', trip.name,
						'id', trip.id,
						'startDate', trip.startDate,
						'endDate', trip.endDate
					)
				) 
			ELSE NULL 
			END
		AS trips
	FROM transaction_record t
	LEFT JOIN transaction_category tc ON t.id = tc.transactionId
	LEFT JOIN category c ON tc.categoryId = c.id
	LEFT JOIN transaction_trip tt ON t.id = tt.transactionId
	LEFT JOIN trip ON tt.tripId = trip.id
	LEFT JOIN source s ON t.sourceId = s.id
	LEFT JOIN source d ON t.destinationId = d.id
	LEFT JOIN investment i ON t.investmentId = i.id
	LEFT JOIN user u ON t.userId = u.id
	WHERE t.id = ?;
`;
export const fetch_all_transactions = `
	SELECT 
		t.id,
		t.amount,
		t.reason,
		t.type,
		t.date,
		s.name AS source,
		d.name AS destination,
		i.name AS investment,
		u.name AS user,
			CASE 
			WHEN COUNT(c.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', c.name)) 
			ELSE NULL 
			END
		AS categories,
			CASE 
			WHEN COUNT(trip.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', trip.name)) 
			ELSE NULL 
			END
		AS trips
	FROM transaction_record t
	LEFT JOIN transaction_category tc ON t.id = tc.transactionId
	LEFT JOIN category c ON tc.categoryId = c.id
	LEFT JOIN transaction_trip tt ON t.id = tt.transactionId
	LEFT JOIN trip ON tt.tripId = trip.id
	LEFT JOIN source s ON t.sourceId = s.id
	LEFT JOIN source d ON t.destinationId = d.id
	LEFT JOIN investment i ON t.investmentId = i.id
	LEFT JOIN user u ON t.userId = u.id
	WHERE t.userId = ?
	GROUP BY t.id
	ORDER BY t.date DESC;
`;
// create queries
export const create_queries = [
	`
	CREATE TABLE IF NOT EXISTS user (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL
	);
`,
	`
	CREATE TABLE IF NOT EXISTS source (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		initialAmount INTEGER NOT NULL,
		currentAmount INTEGER NOT NULL,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`,
	`
	CREATE TABLE IF NOT EXISTS category (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		monthlyBudget INTEGER,
		annualBudget INTEGER,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`,
	`
	CREATE TABLE IF NOT EXISTS investment (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		investedAmount INTEGER NOT NULL,
		currentAmount INTEGER NOT NULL,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`,
	`
	CREATE TABLE IF NOT EXISTS trip (
		id TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		name TEXT NOT NULL,
		startDate DATETIME,
		endDate DATETIME,
		FOREIGN KEY (userId) REFERENCES user (id)
	);
`,
	`
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
`,
	`
	CREATE TABLE IF NOT EXISTS transaction_trip (
		transactionId TEXT NOT NULL,
		tripId TEXT NOT NULL,
		userId TEXT NOT NULL,
		FOREIGN KEY (transactionId) REFERENCES transaction_record (id),
		FOREIGN KEY (tripId) REFERENCES trip (id),
		PRIMARY KEY (transactionId, tripId)
	);
`,
	`
	CREATE TABLE IF NOT EXISTS transaction_category (
		transactionId TEXT NOT NULL,
		categoryId TEXT NOT NULL,
		userId TEXT NOT NULL,
		FOREIGN KEY (transactionId) REFERENCES transaction_record (id),
		FOREIGN KEY (categoryId) REFERENCES category (id),
		PRIMARY KEY (transactionId, categoryId)
	);
`,
];
export const sync_queries: {
	upload: { [key: string]: string };
	delete: string[];
	download: { [key: string]: string };
} = {
	upload: {
		transaction: `SELECT * FROM transaction_record WHERE userId=?`,
		category: `SELECT * FROM category WHERE userId=?`,
		source: `SELECT * FROM source WHERE userId=?`,
		trip: `SELECT * FROM trip WHERE userId=?`,
		investment: `SELECT * FROM investment WHERE userId=?`,
		transaction_trip: `SELECT * FROM transaction_trip WHERE userId=?`,
		transaction_category: `SELECT * FROM transaction_category WHERE userId=?`,
	},
	delete: [
		`DELETE FROM transaction_record WHERE userId=?`,
		`DELETE FROM category WHERE userId=?`,
		`DELETE FROM source WHERE userId=?`,
		`DELETE FROM trip WHERE userId=?`,
		`DELETE FROM investment WHERE userId=?`,
		`DELETE FROM transaction_trip WHERE userId=?`,
		`DELETE FROM transaction_category WHERE userId=?`,
	],
	download: {
		transaction: `INSERT INTO transaction_record(id,userId,sourceId,amount,reason,date,type,destinationId,investmentId) VALUES(?,?,?,?,?,?,?,?,?)`,
		category: `INSERT INTO category(id,userId,name,type,monthlyBudget,annualBudget) VALUES(?,?,?,?,?,?)`,
		trip: `INSERT INTO trip(id,userId,name,startDate,endDate) VALUES(?,?,?,?,?)`,
		source: `INSERT INTO source(id,userId,name,initialAmount,currentAmount) VALUES(?,?,?,?,?)`,
		investment: `INSERT INTO investment(id,userId,name,investedAmount,currentAmount) VALUES(?,?,?,?,?)`,
		transaction_trip: `INSERT INTO transaction_trip(userId,transactionId,tripId) VALUES(?,?,?)`,
		transaction_category: `INSERT INTO transaction_category(userId,transactionId,categoryId) VALUES(?,?,?)`,
	},
};
