import { useState } from "react";
import { generateUUID } from "../../../util/HelperFunctions";
import { useRealm } from "@realm/react";
import { useNavigation } from "@react-navigation/native";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
	PADDING,
} from "../../../config/constants.config";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import Vertical from "../../../components/Vertical";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import InvestmentRoutes from "./InvestmentRoutes";
import InvestmentModel from "../../../models/InvestmentModel";

const InvestmentAdd = () => {
	const [name, setName] = useState("");
	const realm = useRealm();
	const { navigate } = useNavigation<any>();

	const handlePress = () => {
		realm.write(() => {
			realm.create(InvestmentModel, {
				id: generateUUID(),
				name,
			});
		});
		navigate(InvestmentRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={InvestmentRoutes.Main} />
			<CustomText
				text="Add Investment"
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={PADDING / 2} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={handlePress}
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
