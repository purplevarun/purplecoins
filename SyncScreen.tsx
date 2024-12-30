import { logger } from "./HelperFunctions";
import { DB_NAME, FONT_SIZE } from "./constants.config";
import { useSQLiteContext } from "expo-sqlite";
import { delete_queries } from "./queries.config";
import * as DocumentPicker from "expo-document-picker";
import ScreenLayout from "./ScreenLayout";
import CustomButton from "./CustomButton";
import Vertical from "./Vertical";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const SyncScreen = () => {
	const db = useSQLiteContext();
	const handleExport = async () => {
		const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
		await Sharing.shareAsync(dbPath);
	};

	const handleImport = async () => {
		const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
		try {
			const result = await DocumentPicker.getDocumentAsync({
				multiple: false,
			});
			if (result.assets) {
				logger(result.assets[0]);
				const newFileUri = result.assets[0].uri;
				const newContent = await FileSystem.readAsStringAsync(
					newFileUri,
					{
						encoding: FileSystem.EncodingType.Base64,
					},
				);
				await FileSystem.writeAsStringAsync(dbPath, newContent, {
					encoding: FileSystem.EncodingType.Base64,
				});
			}
		} catch (error) {
			console.error("Error importing database:", error);
		}
	};

	const handleClear = () => {
		delete_queries.forEach((query) => db.runSync(query));
	};
	return (
		<ScreenLayout>
			<Vertical size={FONT_SIZE * 2} />
			<CustomButton text={"Export Data"} onPress={handleExport} />
			<CustomButton text={"Import Data"} onPress={handleImport} />
			<CustomButton text={"Clear Data"} onPress={handleClear} />
		</ScreenLayout>
	);
};

export default SyncScreen;
