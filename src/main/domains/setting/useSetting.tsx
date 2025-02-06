import { randomUUID } from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { DB_FILE_PATH } from "../../constants/constants.config";
import query from "../../constants/query";

const useSetting = () => {
	const db = useSQLiteContext();
	const encoding = FileSystem.EncodingType.Base64;
	const handleExport = async () => {
		await Sharing.shareAsync(DB_FILE_PATH);
	};

	const handleImport = async () => {
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

	const handleClear = async () => {
		query.drop_tables.forEach((cmd) => db.runSync(cmd));
		query.create_tables.forEach((cmd) => db.runSync(cmd));
	};

	const addSampleData = async () => {
		await handleClear();
		sampleCategories.forEach((item) => {
			db.runSync(query.add_category, [randomUUID(), item]);
		});
		sampleInvestments.forEach((item) => {
			db.runSync(query.add_investment, [randomUUID(), item]);
		});
		sampleTrips.forEach((item) =>
			db.runSync(query.add_trip, [randomUUID(), item]),
		);
		sampleSources.forEach((item) =>
			db.runSync(query.add_source, [randomUUID(), item]),
		);
	};

	return {
		addSampleData,
		handleImport,
		handleExport,
		handleClear,
	};
};

const sampleTrips = [
	"2211 Kerela",
	"2212 Kolkata",
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
	"Fixed Deposit",
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
