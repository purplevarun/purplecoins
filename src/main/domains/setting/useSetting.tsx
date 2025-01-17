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
		db.runSync(delete_tables);
	};

	return {
		handleImport,
		handleExport,
		handleClear,
	};
};

const delete_tables = `
	DELETE FROM "transaction";
	DELETE FROM "category";
	DELETE FROM "trip";
	DELETE FROM "investment";
	DELETE FROM "source";
	DELETE FROM "transaction_trip";
	DELETE FROM "transaction_category";
`;

export default useSetting;
