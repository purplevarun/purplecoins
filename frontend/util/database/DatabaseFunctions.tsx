import { generateUUID, logger, toInt } from "../helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { IInvestment, ISource, ITrip } from "./DatabaseSchema";
import useAuthService from "../../screens/auth/AuthService";

const useDatabase = () => {
	const db = useSQLiteContext();
	const { getUser } = useAuthService();
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
			const iAmount = initialAmount.length === 0 ? 0 : parseInt(initialAmount);
			db.runSync(query, [id, userId, name, iAmount, iAmount]);
			logger("created source");
		} catch (e) {
			logger("ERROR: creating source", e);
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

	const createInvestment = (name: string, investedAmount: string, currentAmount: string) => {
		try {
			const query = "INSERT INTO investment (id, userId, name, investedAmount, currentAmount) VALUES (?, ?, ?, ?, ?)";
			const id = generateUUID();
			const userId = getUser().id;
			db.runSync(query, [id, userId, name, toInt(investedAmount), toInt(currentAmount)]);
		} catch (e) {
			logger("ERROR: creating investment", e);
		}
	};

	return {
		getTrips,
		getSources,
		getInvestments,
		createTables,
		createSource,
		createTrip,
		createInvestment
	};
};
export default useDatabase;
