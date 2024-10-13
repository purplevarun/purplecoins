import { TouchableOpacity, View } from "react-native";
import { FONT_SIZE, HEADER_ICON_SIZE } from "../../../config/dimensions.config";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useRealm } from "@realm/react";
import uuid from "react-native-uuid";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ComponentText from "../../../components/Component.Text";
import ComponentInput from "../../../components/Component.Input";
import ComponentLayout from "../../../components/Component.Layout";
import ComponentButton from "../../../components/Component.Button";
import ComponentDropdown from "../../../components/Component.Dropdown";
import TransactionModel from "../../../models/TransactionModel";

const ScreenFinanceTransactionAdd = () => {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
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
		<ComponentLayout>
			<TouchableOpacity
				style={{
					alignSelf: "flex-start",
					paddingTop: FONT_SIZE * 0.5,
					paddingLeft: FONT_SIZE * 0.5,
				}}
				onPress={() => navigate("Transaction.Main")}
			>
				<FontAwesome
					name="window-close"
					size={HEADER_ICON_SIZE * 1.2}
					color={"#c1121f"}
				/>
			</TouchableOpacity>
			<ComponentText
				text="Add Transaction"
				alignSelf="center"
				fontSize={FONT_SIZE * 1.5}
			/>
			<ComponentInput
				value={amount}
				setValue={setAmount}
				name="Amount"
				type={"number-pad"}
			/>
			<ComponentInput value={reason} setValue={setReason} name="Reason" />
			<ComponentDropdown />
			<View
				style={{
					alignItems: "center",
					paddingTop: FONT_SIZE * 0.8,
				}}
			>
				<ComponentButton
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
			</View>
		</ComponentLayout>
	);
};

export default ScreenFinanceTransactionAdd;
