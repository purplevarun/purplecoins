import { generateUUID } from "../../../util/HelperFunctions";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useRealm } from "@realm/react";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
	PADDING,
} from "../../../config/constants.config";
import SourceRoutes from "./SourceRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CloseButton from "../../../components/CloseButton";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import Vertical from "../../../components/Vertical";
import CustomButton from "../../../components/CustomButton";
import SourceModel from "../../../models/SourceModel";

const SourceAdd = () => {
	const [name, setName] = useState("");
	const [initialAmount, setInitialAmount] = useState("");
	const realm = useRealm();
	const { navigate } = useNavigation<any>();

	const handlePress = () => {
		realm.write(() => {
			realm.create(SourceModel, {
				id: generateUUID(),
				name,
				initialAmount: parseInt(initialAmount),
				amount: parseInt(initialAmount),
			});
		});
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
			<Vertical size={PADDING / 2} />
			<CustomInput name={"Name"} value={name} setValue={setName} />
			<CustomInput
				name={"Initial Balance"}
				value={initialAmount}
				setValue={setInitialAmount}
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={handlePress}
			/>
		</ScreenLayout>
	);
};

export default SourceAdd;
