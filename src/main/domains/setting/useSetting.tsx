import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { DB_FILE_PATH } from "../../constants/constants.config";
import create_tables from "../../constants/queries/create_tables";
import drop_tables from "../../constants/queries/drop_tables";

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

	const handleClear = () => {
		drop_tables.forEach((cmd) => db.runSync(cmd));
		create_tables.forEach((cmd) => db.runSync(cmd));
	};

	return {
		handleImport,
		handleExport,
		handleClear,
	};
};

export default useSetting;
