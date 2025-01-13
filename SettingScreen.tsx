import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import Vertical from "./Vertical";
import { DB_FILE_PATH, FONT_SIZE } from "./constants.config";
import CustomButton from "./src/main/components/buttons/CustomButton";

const SettingScreen = () => {
	const db = useSQLiteContext();
	const handleExport = async () => {
		await Sharing.shareAsync(DB_FILE_PATH);
	};

	const delete_queries = [
		`DELETE FROM "transaction";`,
		`DELETE FROM "category";`,
		`DELETE FROM "source";`,
		`DELETE FROM "trip";`,
		`DELETE FROM "investment";`,
		`DELETE FROM "transaction_trip";`,
		`DELETE FROM "transaction_category";`,
	];

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
		delete_queries.forEach((query) => db.runSync(query));
	};
	const show_clear_button =
		process.env.EXPO_PUBLIC_SHOW_CLEAR_BUTTON ?? false;
	return (
		<ScreenLayout>
			<Header />
			<Vertical size={FONT_SIZE * 2} />
			<CustomButton text={"Export Data"} onPress={handleExport} />
			<CustomButton text={"Import Data"} onPress={handleImport} />
			{show_clear_button && (
				<CustomButton text={"Clear Data"} onPress={handleClear} />
			)}
		</ScreenLayout>
	);
};

export default SettingScreen;
