import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { DB_FILE_PATH } from "../../constants/constants.config";
import RelationType from "../../constants/enums/RelationType";
import TransactionAction from "../../constants/enums/TransactionAction";
import TransactionType from "../../constants/enums/TransactionType";
import create_tables from "../../constants/queries/create_tables";
import drop_tables from "../../constants/queries/drop_tables";
import useDatabase from "../../hooks/useDatabase";
import { convertStringToDate } from "../../util/HelperFunctions";

const useSetting = () => {
	const { addRelation, addTransaction } = useDatabase();
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
		sampleTransactions.forEach((txn) => {
			addTransaction(
				txn.amount,
				txn.reason,
				txn.action,
				txn.type,
				convertStringToDate(txn.date),
			);
		});
	};

	return {
		addSampleData,
		handleImport,
		handleExport,
		handleClear,
	};
};

const sampleTransactions = [
	{
		amount: 14464,
		reason: "Thoughtworks Stipend",
		date: "28/02/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 500,
		reason: "Given to Maa",
		date: "28/02/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 20250,
		reason: "Thoughtworks Stipend",
		date: "31/03/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 38,
		reason: "Bank Interest",
		date: "31/03/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 2,
		reason: "Bank Charges",
		date: "17/04/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 20250,
		reason: "Thoughtworks Stipend",
		date: "30/04/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 20250,
		reason: "Thoughtworks Stipend",
		date: "01/06/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 20250,
		reason: "Thoughtworks Stipend",
		date: "30/06/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 411,
		reason: "Bank Interest",
		date: "01/07/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 3930,
		reason: "ITR Return",
		date: "26/07/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 20250,
		reason: "Thoughtworks Stipend",
		date: "29/07/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 4278,
		reason: "RDP to BLR Flight",
		date: "20/09/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 450,
		reason: "Food",
		date: "20/09/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 140,
		reason: "Food",
		date: "21/09/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 50,
		reason: "Food",
		date: "21/09/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 7441,
		reason: "TVM to RDP Flight",
		date: "21/09/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 11105,
		reason: "Thoughtworks Stipend",
		date: "22/09/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 32028,
		reason: "S21 Fe Phone",
		date: "23/09/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 107194,
		reason: "Thoughtworks Salary",
		date: "29/09/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 836,
		reason: "Bank Interest",
		date: "02/10/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 1340,
		reason: "Slice credit card",
		date: "07/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 5000,
		reason: "Given to Maa",
		date: "07/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 10000,
		reason: "Invested in Mirae Asset",
		date: "12/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.INVESTMENT,
	},
	{
		amount: 400,
		reason: "Dr. Santosh",
		date: "13/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 100,
		reason: "Hangla Hut Momos",
		date: "13/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 2200,
		reason: "Dr. Santosh Cavities",
		date: "16/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 90000,
		reason: "Sent to Papa",
		date: "16/10/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 50000,
		reason: "Received from Papa",
		date: "21/10/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 72557,
		reason: "Thoughtworks Salary",
		date: "28/10/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 116,
		reason: "Chai at Airport",
		date: "10/11/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 10000,
		reason: "Invested in Mirae Asset",
		date: "18/11/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.INVESTMENT,
	},
	{
		amount: 72557,
		reason: "Thoughtworks Salary",
		date: "29/11/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 5000,
		reason: "Given to Maa",
		date: "30/11/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 10000,
		reason: "Invested in Mirae Asset",
		date: "19/12/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.INVESTMENT,
	},
	{
		amount: 5000,
		reason: "Axis to SBI",
		date: "20/12/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.TRANSFER,
	},
	{
		amount: 6229,
		reason: "RDP to BLR Flight",
		date: "23/12/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 499,
		reason: "Shoes",
		date: "24/12/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 199,
		reason: "Secret Santa Gift in GS",
		date: "24/12/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.GENERAL,
	},
	{
		amount: 5000,
		reason: "Axis to SBI",
		date: "25/12/2022",
		action: TransactionAction.DEBIT,
		type: TransactionType.TRANSFER,
	},
	{
		amount: 74975,
		reason: "Thoughtworks Salary",
		date: "29/12/2022",
		action: TransactionAction.CREDIT,
		type: TransactionType.GENERAL,
	},
];

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
