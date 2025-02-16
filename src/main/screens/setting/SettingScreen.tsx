import { useState } from "react";
import CustomButton from "../../components/button/CustomButton";
import ConfirmationModal from "../../components/button/header/ConfirmationModal";
import Header from "../../components/header/Header";
import ScreenLayout from "../../components/layout/ScreenLayout";
import Vertical from "../../components/layout/Vertical";
import { RED_COLOR } from "../../constants/config/colors.config";
import { FONT_SIZE } from "../../constants/config/constants.config";
import useSetting from "./useSetting";

const SettingScreen = () => {
	const { handleImport, handleExport, handleClear } = useSetting();
	const [modal, setModal] = useState(false);
	return (
		<ScreenLayout>
			<Header />
			<Vertical size={FONT_SIZE} />
			<CustomButton text={"Export Data"} onPress={handleExport} />
			<CustomButton text={"Import Data"} onPress={handleImport} />
			<CustomButton
				text={"Clear Data"}
				onPress={() => setModal(true)}
				color={RED_COLOR}
			/>
			{modal && (
				<ConfirmationModal setModal={setModal} onDelete={handleClear} />
			)}
		</ScreenLayout>
	);
};

export default SettingScreen;
