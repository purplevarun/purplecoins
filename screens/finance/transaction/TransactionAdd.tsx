import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { generateUUID } from "../../../util/HelperFunctions";
import { useQuery, useRealm } from "@realm/react";
import CustomText from "../../../components/CustomText";
import CustomInput from "../../../components/CustomInput";
import ScreenLayout from "../../../components/ScreenLayout";
import CustomButton from "../../../components/CustomButton";
import CategoryDropdown from "../../../components/CategoryDropdown";
import CloseButton from "../../../components/CloseButton";
import TypeSelector from "../../../components/TypeSelector";
import TransactionRoutes from "./TransactionRoutes";
import TransactionModel from "../../../models/TransactionModel";
import ExpenseType from "../../../types/ExpenseType";
import UserModel from "../../../models/UserModel";

const TransactionAdd = () => {
	const [type, setType] = useState<ExpenseType>(ExpenseType.EXPENSE);
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [categories, setCategories] = useState<string[]>([]);
	const { navigate } = useNavigation<any>();
	const realm = useRealm();
	const userModels = useQuery(UserModel);

	const isDisabled = () => {
		try {
			const amountInt = new Function(`return ${amount}`)();
			if (isNaN(amountInt)) return true;
			return amountInt > 0 && reason.length > 0;
		} catch {
			return true;
		}
	};

	const handlePress = () => {
		realm.write(() => {
			realm.create(TransactionModel, {
				id: generateUUID(),
				amount: new Function(`return ${amount}`)(),
				reason,
				type,
				date: new Date(),
				userId: userModels[0]?.id,
				categories: categories,
			});
		});
		navigate(TransactionRoutes.Main);
	};

	return (
		<ScreenLayout>
			<CloseButton path={TransactionRoutes.Main} />
			<CustomText
				text="Add Transaction"
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<TypeSelector value={type} setValue={setType} enableTransfer />
			<CustomInput
				value={amount}
				setValue={setAmount}
				name={"Amount"}
				numeric
			/>
			<CustomInput value={reason} setValue={setReason} name={"Reason"} />
			<CategoryDropdown
				type={type}
				value={categories}
				setValue={setCategories}
			/>
			<CustomButton
				text={"Submit"}
				disabled={!isDisabled()}
				onPress={handlePress}
			/>
		</ScreenLayout>
	);
};

export default TransactionAdd;
