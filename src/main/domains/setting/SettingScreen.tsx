import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import Vertical from "../../components/Vertical";
import CustomButton from "../../components/buttons/CustomButton";
import { RED_COLOR } from "../../constants/colors.config";
import { FONT_SIZE } from "../../constants/constants.config";
import useSetting from "./useSetting";

const SettingScreen = () => {
	const { handleImport, handleExport, handleClear, addSampleData } =
		useSetting();
	return (
		<ScreenLayout>
			<Header />
			<Vertical size={FONT_SIZE} />
			<CustomButton text={"Export Data"} onPress={handleExport} />
			<CustomButton text={"Import Data"} onPress={handleImport} />
			{__DEV__ && (
				<CustomButton
					text={"Clear Data"}
					onPress={handleClear}
					color={RED_COLOR}
				/>
			)}
			<CustomButton text={"Add Sample Data"} onPress={addSampleData} />
		</ScreenLayout>
	);
};

export default SettingScreen;
