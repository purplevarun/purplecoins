import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
	PADDING
} from "../../../config/constants.config";
import InvestmentRoutes from "./InvestmentRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomText from "../../../components/CustomText";
import CloseButton from "../../../components/CloseButton";
import Vertical from "../../../components/Vertical";
import CustomInput from "../../../components/CustomInput";
import CustomButton from "../../../components/CustomButton";
import useDatabase from "../../../util/database/DatabaseFunctions";

const InvestmentAdd = () => {
	const [name, setName] = useState("");
	const [investedAmount, setInvestedAmount] = useState("");
	const [currentAmount, setCurrentAmount] = useState("");
	const { navigate } = useNavigation<any>();
	const { createInvestment } = useDatabase();
	const handlePress = () => {
		createInvestment(name, investedAmount, currentAmount);
		navigate(InvestmentRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={InvestmentRoutes.Main} />
			<Vertical />
			<CustomText
				text={"Add Investment"}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<Vertical size={PADDING / 2} />
			<CustomInput
				name={"Name"}
				value={name}
				setValue={setName}
				required
			/>
			<CustomInput
				name={"Invested Amount"}
				value={investedAmount}
				setValue={setInvestedAmount}
				numeric
			/>
			<CustomInput
				name={"Current Amount"}
				value={currentAmount}
				setValue={setCurrentAmount}
				numeric
			/>
			<CustomButton
				disabled={name.length < MINIMUM_LENGTH}
				onPress={handlePress}
			/>
		</ScreenLayout>
	);
};

export default InvestmentAdd;
