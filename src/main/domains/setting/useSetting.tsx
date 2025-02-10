import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { DB_FILE_PATH } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import create_tables from "../../constants/queries/create_tables";
import drop_tables from "../../constants/queries/drop_tables";
import useDatabase from "../../hooks/useDatabase";

const useSetting = () => {
	const { addRelation } = useDatabase();
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

	const handleClear = () => {
		drop_tables.forEach((cmd) => db.runSync(cmd));
		create_tables.forEach((cmd) => db.runSync(cmd));
	};

	const addSampleData = () => {
		handleClear();
		sampleSources.forEach((item) => {
			addRelation(item, RelationType.SOURCE);
		});
		sampleCategories.forEach((item) => {
			addRelation(item, RelationType.CATEGORY);
		});
		sampleTrips.forEach((item) => {
			addRelation(item, RelationType.TRIP);
		});
		sampleInvestments.forEach((item) => {
			addRelation(item, RelationType.INVESTMENT);
		});
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
