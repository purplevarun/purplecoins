import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import CustomButton from "./CustomButton";
import Header from "./Header";
import ScreenLayout from "./ScreenLayout";
import Vertical from "./Vertical";
import { RED_COLOR } from "./colors.config";
import { FONT_SIZE } from "./constants.config";
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
