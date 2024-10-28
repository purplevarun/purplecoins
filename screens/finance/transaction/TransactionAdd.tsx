import { CENTER, LARGE_FONT_SIZE } from "../../../config/constants.config";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useRealm } from "@realm/react";
import uuid from "react-native-uuid";
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

const TransactionAdd = () => {
	const [type, setType] = useState<ExpenseType>(ExpenseType.EXPENSE);
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [category, setCategory] = useState("");
	const { navigate } = useNavigation<any>();
	const realm = useRealm();

	const isDisabled = () => {
		try {
			const amountInt = parseInt(amount);
			return amountInt > 0 && reason.length > 0;
		} catch {
			return true;
		}
	};

	const onPress = () => {
		realm.write(() => {
			realm.create(TransactionModel, {
				id: uuid.v4().toString(),
				amount: parseInt(amount),
				reason,
				type,
				date: new Date(),
				userId: uuid.v4().toString(),
				categoryId: category,
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
			{type !== ExpenseType.TRANSFER && (
				<CategoryDropdown
					type={type}
					value={category}
					setValue={setCategory}
				/>
			)}
			<CustomButton
				text={"Submit"}
				disabled={!isDisabled()}
				onPress={onPress}
			/>
		</ScreenLayout>
	);
};

export default TransactionAdd;
