import { generateUUID, logger } from "../HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { ICategory, IInvestment, ISource, ITransaction, ITrip, IUser } from "./DatabaseSchema";
import ExpenseType from "../../types/ExpenseType";

const useDatabase = () => {
	const db = useSQLiteContext();

	const createTables = () => {
		db.runSync(`CREATE TABLE IF NOT EXISTS user (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS source (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			name TEXT NOT NULL,
			initialAmount INTEGER NOT NULL,
			currentAmount INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user (id)
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS category (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			monthlyBudget INTEGER,
			annualBudget INTEGER,
			FOREIGN KEY (userId) REFERENCES user (id)
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS investment (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			name TEXT NOT NULL,
			investedAmount INTEGER NOT NULL,
			currentAmount INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user (id)
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS trip (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			name TEXT NOT NULL,
			startDate DATETIME,
			endDate DATETIME,
			FOREIGN KEY (userId) REFERENCES user (id)
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS transaction_record (
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
			FOREIGN KEY (destinationId) REFERENCES source (id)
			FOREIGN KEY (investmentId) REFERENCES investment (id)
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS transaction_trip (
			transactionId TEXT NOT NULL,
			tripId TEXT NOT NULL,
			userId TEXT NOT NULL,
			FOREIGN KEY (transactionId) REFERENCES transaction_record (id),
			FOREIGN KEY (tripId) REFERENCES trip (id),
			FOREIGN KEY (userId) REFERENCES user (id),
			PRIMARY KEY (transactionId, tripId)
    	);`);
		db.runSync(`CREATE TABLE IF NOT EXISTS transaction_category (
			transactionId TEXT NOT NULL,
			categoryId TEXT NOT NULL,
			userId TEXT NOT NULL,
			FOREIGN KEY (transactionId) REFERENCES transaction_record (id),
			FOREIGN KEY (categoryId) REFERENCES category (id),
			FOREIGN KEY (userId) REFERENCES user (id),
			PRIMARY KEY (transactionId, categoryId)
		);`);
		logger("created all tables");
	};

	const getUser = () => {
		const undefinedUser = { id: "undefinedId", name: "undefinedName" };
		try {
			const query = "SELECT * from user";
			const firstUser = db.getFirstSync<IUser>(query);
			if (firstUser) {
				logger("fetched first user", firstUser);
				return firstUser;
			} else {
				logger("firstUser is null");
				return undefinedUser;
			}
		} catch (e) {
			logger("ERROR: fetching first user", e);
			return undefinedUser;
		}
	};

	const doesUserExist = () => {
		try {
			const query = "SELECT * from user";
			const users = db.getAllSync<IUser>(query);
			logger("fetched users", users);
			return users != null && users.length > 0;
		} catch (e) {
			logger("ERROR: fetching users", e);
			return false;
		}
	};

	const getTransactions = () => {
		try {
			const query = "SELECT * from transaction_record where userId=?";
			const userId = getUser().id;
			const transactions = db.getAllSync<ITransaction>(query, [userId]);
			logger("fetched transactions", transactions);
			return transactions;
		} catch (e) {
			logger("ERROR: fetching transactions", e);
			return [];
		}
	};

	const getTransactionsData = () => {
		try {
			const query = "SELECT t.*,c.* from transaction_record t AND category c WHERE userId=? AND c.id in t.id";
			const userId = getUser().id;
			const transactions = db.getAllSync<ITransaction>(query, [userId]);
			logger("fetched transactions", transactions);
			return transactions;
		} catch (e) {
			logger("ERROR: fetching transactions", e);
			return [];
		}
	}

	const getCategories = () => {
		try {
			const query = "SELECT * from category where userId=?";
			const userId = getUser().id;
			const categories = db.getAllSync<ICategory>(query, [userId]);
			logger("fetched categories", categories);
			return categories;
		} catch (e) {
			logger("ERROR: fetching categories", e);
			return [];
		}
	};

	const getInvestments = () => {
		try {
			const query = "SELECT * from investment where userId=?";
			const userId = getUser().id;
			const investments = db.getAllSync<IInvestment>(query, [userId]);
			logger("fetched investments", investments);
			return investments;
		} catch (e) {
			logger("ERROR: fetching investments", e);
			return [];
		}
	};

	const getSources = () => {
		try {
			const query = "SELECT * from source where userId=?";
			const userId = getUser().id;
			const sources = db.getAllSync<ISource>(query, [userId]);
			logger("fetched sources", sources);
			return sources;
		} catch (e) {
			logger("ERROR: fetching sources", e);
			return [];
		}
	};

	const getTrips = () => {
		try {
			const query = "SELECT * from trip where userId=?";
			const userId = getUser().id;
			const trips = db.getAllSync<ITrip>(query, [userId]);
			logger("fetched trips", trips);
			return trips;
		} catch (e) {
			logger("ERROR: fetching trips", e);
			return [];
		}
	};

	const createSource = (name: string, initialAmount: string) => {
		try {
			const query = "INSERT INTO source (id, userId, name, initialAmount, currentAmount) VALUES (?, ?, ?, ?, ?)";
			const id = generateUUID();
			const userId = getUser().id;
			db.runSync(query, [id, userId, name, initialAmount, initialAmount]);
			logger("created source");
		} catch (e) {
			logger("ERROR: creating source", e);
		}
	};

	const createUser = (id: string, name: string) => {
		try {
			const query = "INSERT INTO user (id, name) VALUES (?, ?)";
			db.runSync(query, [id, name]);
			logger("created new user");
		} catch (e) {
			logger("ERROR: creating user", e);
		}
	};

	const createTrip = (name: string, startDate: Date | null, endDate: Date | null) => {
		try {
			const id = generateUUID();
			const userId = getUser().id;
			const bothQuery = "INSERT INTO trip (id, userId, name, startDate, endDate) VALUES (?, ?, ?, ?, ?)";
			const singleQuery = "INSERT INTO trip (id, userId, name, startDate) VALUES (?, ?, ?, ?)";
			const noneQuery = "INSERT INTO trip (id, userId, name) VALUES (?, ?, ?)";
			if (startDate && endDate) db.runSync(bothQuery, [id, userId, name, startDate.toString(), endDate.toString()]);
			else if (startDate) db.runSync(singleQuery, [id, userId, name, startDate.toString()]);
			else if (endDate) db.runSync(singleQuery, [id, userId, name, endDate.toString()]);
			else db.runSync(noneQuery, [id, userId, name]);
			logger("created new trip");
		} catch (e) {
			logger("ERROR: creating trip", e);
		}
	};

	const createTransaction = (amount: string, reason: string, type: ExpenseType, date: Date, source: string, destination: string, investment: string) => {
		try {
			const calculatedAmount = parseInt(amount);
			const query = "INSERT INTO transaction_record (id,userId,sourceId,amount,reason,type,date,destinationId,investmentId) VALUES (?,?,?,?,?,?,?,?,?)";
			const sourceQuery = "UPDATE source SET currentAmount=currentAmount-? WHERE id=?";
			const destinationQuery = "UPDATE source SET currentAmount=currentAmount+? WHERE id=?";
			const investmentQuery = "UPDATE investment SET investedAmount=investedAmount+? WHERE id=?";
			const userId = getUser().id;
			const id = generateUUID();
			db.runSync(query, [id, userId, source, amount, reason, type, date.toString(), destination, investment]);
			if (type === ExpenseType.EXPENSE) {
				db.runSync(sourceQuery, [calculatedAmount, source]);
			} else if (type === ExpenseType.INCOME) {
				db.runSync(destinationQuery, [calculatedAmount, source]);
			} else if (type === ExpenseType.INVESTMENT) {
				db.runSync(sourceQuery, [calculatedAmount, source]);
				db.runSync(investmentQuery, [calculatedAmount, source]);
			} else if (type === ExpenseType.TRANSFER) {
				db.runSync(sourceQuery, [calculatedAmount, source]);
				db.runSync(destinationQuery, [calculatedAmount, destination]);
			}
			logger("added new transaction");
		} catch (e) {
			logger("ERROR: creating transaction", e);
		}
	};

	const createCategory = (name: string, type: ExpenseType) => {
		try {
			const query = "INSERT INTO category (id, userId, name, type) VALUES (?, ?, ?, ?)";
			const userId = getUser().id;
			const id = generateUUID();
			db.runSync(query, [id, userId, name, type]);
		} catch (e) {
			logger("ERROR: creating category", e);
		}
	};

	const createInvestment = (name: string, investedAmount: string, currentAmount: string) => {
		try {
			const query = "INSERT INTO investment (id, userId, name, investedAmount, currentAmount) VALUES (?, ?, ?, ?, ?, ?)";
			const id = generateUUID();
			const userId = getUser().id;
			db.runSync(query, [id, userId, name, investedAmount, currentAmount]);
		} catch (e) {
			logger("ERROR: creating investment", e);
		}
	};

	const createTransactionTrip = (transactionId: string, tripId: string) => {
		try {
			const query = "INSERT INTO transaction_trip (userId, transactionId, tripId) VALUES (?, ?, ?)";
			const userId = getUser().id;
			db.runSync(query, [userId, transactionId, tripId]);
		} catch (e) {
			logger("ERROR: creating transaction_trip", e);
		}

	};

	const createTransactionCategory = (transactionId: string, categoryId: string) => {
		try {
			const query = "INSERT INTO transaction_category (userId, transactionId, categoryId) VALUES (?, ?, ?)";
			const userId = getUser().id;
			db.runSync(query, [userId, transactionId, categoryId]);
		} catch (e) {
			logger("ERROR: creating transaction_category", e);
		}
	};

	const logOut = () => {
		try {
			db.runSync("DROP TABLE user;");
			logger("dropped user table");
		} catch (e) {
			logger("ERROR: deleting user table");
		}
	};

	return {
		getTransactions,
		getCategories,
		getTrips,
		getSources,
		getInvestments,
		getUser,
		doesUserExist,
		createTables,
		createSource,
		createUser,
		createTransaction,
		createTrip,
		createCategory,
		createInvestment,
		createTransactionTrip,
		createTransactionCategory,
		logOut
	};
};
export default useDatabase;
