import { FONT_SIZE } from "../../../config/dimensions.config";
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
import TypeSwitch from "../../../components/TypeSwitch";
import TransactionModel from "../../../models/TransactionModel";

const TransactionAdd = () => {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [type, setType] = useState(false);
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

	return (
		<ScreenLayout>
			<CloseButton path={"Transaction.Main"} />
			<CustomText
				text="Add Transaction"
				alignSelf="center"
				fontSize={FONT_SIZE * 1.5}
			/>
			<TypeSwitch value={type} setValue={setType} />
			<CustomInput
				value={amount}
				setValue={setAmount}
				name="Amount"
				type={"number-pad"}
			/>
			<CustomInput value={reason} setValue={setReason} name="Reason" />
			<CategoryDropdown type={type ? "INCOME" : "EXPENSE"} />
			<CustomButton
				text={"Submit"}
				disabled={!isDisabled()}
				onPress={() => {
					realm.write(() => {
						realm.create(TransactionModel, {
							id: uuid.v4().toString(),
							amount: parseInt(amount),
							reason: reason,
							type: "income",
							date: new Date(),
							userId: uuid.v4().toString(),
							categoryId: uuid.v4().toString(),
						});
					});
					navigate("Transaction.Main");
				}}
			/>
		</ScreenLayout>
	);
};

export default TransactionAdd;
