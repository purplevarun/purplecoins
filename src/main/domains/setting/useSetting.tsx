import { randomUUID } from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { DB_FILE_PATH } from "../../constants/constants.config";

const useSetting = () => {
	const db = useSQLiteContext();
	const handleExport = async () => {
		await Sharing.shareAsync(DB_FILE_PATH);
	};

	const handleImport = async () => {
		const encoding = FileSystem.EncodingType.Base64;
		const result = await DocumentPicker.getDocumentAsync();
		if (!result.assets) return;
		const [{ uri }] = result.assets;
		const content = await FileSystem.readAsStringAsync(uri, {
			encoding,
		});
		await FileSystem.writeAsStringAsync(DB_FILE_PATH, content, {
			encoding,
		});
	};

	const handleClear = () => {
		delete_tables.forEach((query) => db.runSync(query));
	};

	const addSampleData = () => {
		handleClear();
		sampleCategories.forEach((item) => {
			db.runSync(`INSERT INTO "category" (id,name) VALUES (?,?)`, [
				randomUUID(),
				item,
			]);
		});
		sampleInvestments.forEach((item) => {
			db.runSync(`INSERT INTO "investment" (id,name) VALUES (?,?)`, [
				randomUUID(),
				item,
			]);
		});
		sampleTrips.forEach((item) =>
			db.runSync(`INSERT INTO "trip" (id,name) VALUES (?,?)`, [
				randomUUID(),
				item,
			]),
		);
		sampleSources.forEach((item) =>
			db.runSync(`INSERT INTO "source" (id,name) VALUES (?,?)`, [
				randomUUID(),
				item,
			]),
		);
	};

	return {
		addSampleData,
		handleImport,
		handleExport,
		handleClear,
	};
};

const delete_tables = [
	`DELETE FROM "transaction"`,
	`DELETE FROM "category"`,
	`DELETE FROM "trip"`,
	`DELETE FROM "investment"`,
	`DELETE FROM "source"`,
	`DELETE FROM "transaction_trip"`,
	`DELETE FROM "transaction_category"`,
];

const sampleTrips = [
	"2301 Bangalore",
	"2302 Rajgir",
	"2303 Goa",
	"2304 Gurgaon",
	"2308 Moradabad",
	"2312 Bangalore",
	"2401 Gurgaon",
	"2402 Mumbai",
	"2403 Gangtok",
	"2404 Manali",
	"2404 Moradabad",
];

const sampleInvestments = [
	"Indian Mutual Funds",
	"Indian Stocks",
	"US Stocks",
	"12% Club",
];

const sampleSources = ["Axis Bank", "State Bank"];

const sampleCategories = [
	"Salary",
	"Thoughtworks",
	"Household",
	"Bank Charges",
	"ITR",
	"Food",
	"Travel",
	"Train",
	"Bus",
	"Flight",
	"Shopping",
	"Internet",
	"Haircut",
	"Personal",
	"Doctor",
	"OTT",
	"Gifts",
	"Electricity",
	"Bike",
	"Car",
	"Petrol",
	"Baleno",
	"SP 125",
];
export default useSetting;
