import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MARGIN,
	MINIMUM_LENGTH,
} from "../../../config/constants.config";
import SourceRoutes from "./SourceRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import Vertical from "../../../components/Vertical";
import CustomButton from "../../../components/CustomButton";
import useDatabase from "../../../util/DatabaseFunctions";

const SourceAdd = () => {
	const { createSource } = useDatabase();
	const { navigate } = useNavigation<any>();
	const [name, setName] = useState("");
	const [initialAmount, setInitialAmount] = useState("");

	const handlePress = () => {
		createSource(name, initialAmount);
		navigate(SourceRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={SourceRoutes.Main} />
			<CustomText
				text="Add Source"
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={MARGIN} />
			<CustomInput
				name={"Name"}
				value={name}
				setValue={setName}
				required
			/>
			<CustomInput
				name={"Initial Balance"}
				value={initialAmount}
				setValue={setInitialAmount}
				numeric
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={handlePress}
			/>
		</ScreenLayout>
	);
};

export default SourceAdd;
