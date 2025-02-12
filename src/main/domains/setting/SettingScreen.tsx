import { useState } from "react";
import Header from "../../components/Header";
import ScreenLayout from "../../components/ScreenLayout";
import Vertical from "../../components/Vertical";
import CustomButton from "../../components/buttons/CustomButton";
import ConfirmationModal from "../../components/buttons/header/ConfirmationModal";
import { RED_COLOR } from "../../constants/colors.config";
import { FONT_SIZE } from "../../constants/constants.config";
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
