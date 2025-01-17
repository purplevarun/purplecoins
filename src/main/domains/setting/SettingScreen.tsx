import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import Vertical from "../../components/Vertical";
import CustomButton from "../../components/buttons/CustomButton";
import { FONT_SIZE } from "../../constants/constants.config";
import useSetting from "./useSetting";

const SettingScreen = () => {
	const { handleImport, handleExport, handleClear } = useSetting();
	return (
		<ScreenLayout>
			<Header />
			<Vertical size={FONT_SIZE * 2} />
			<CustomButton text={"Export Data"} onPress={handleExport} />
			<CustomButton text={"Import Data"} onPress={handleImport} />
			{__DEV__ && (
				<CustomButton text={"Clear Data"} onPress={handleClear} />
			)}
		</ScreenLayout>
	);
};

export default SettingScreen;
