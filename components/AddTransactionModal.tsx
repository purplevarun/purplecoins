import {
	KeyboardAvoidingView,
	Modal,
	TouchableOpacity,
	View,
} from "react-native";
import {
	borderRadius,
	flex,
	FONT_SIZE,
	HEADER_ICON_SIZE,
	padding,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
} from "../config/Constants";
import MyText from "./MyText";
import MyInput from "./MyInput";
import { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import useTransaction from "../stores/TransactionStore";
import {
	backgroundColor,
	disabledColor,
	headerColor,
	primaryColor,
} from "../config/Colors";
import { Dropdown } from "react-native-element-dropdown";
const AddTransactionModal = () => {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const { toggleAddTransactionModal } = useTransaction();
	return (
		<Modal transparent>
			<View
				style={{
					justifyContent: "center",
					alignItems: "center",
					flex,
					backgroundColor: "rgba(0,0,0,0.7)",
				}}
			>
				<View
					style={{
						backgroundColor: headerColor,
						width: SCREEN_WIDTH * 0.9,
						// height: SCREEN_HEIGHT * 0.8,
						borderColor: primaryColor,
						borderWidth: 2,
						borderRadius,
						padding,
					}}
				>
					<KeyboardAvoidingView
					// style={{
					// 	flex: 1,
					// 	justifyContent: "center",
					// 	alignItems: "center",
					// }}
					>
						<TouchableOpacity
							style={{ alignSelf: "flex-end" }}
							onPress={toggleAddTransactionModal}
						>
							<FontAwesome
								name="window-close"
								size={HEADER_ICON_SIZE}
								color={"red"}
							/>
						</TouchableOpacity>
						<MyText
							text="Add Transaction"
							alignSelf="center"
							size={FONT_SIZE * 1.5}
						/>
						<MyInput
							value={amount}
							setValue={setAmount}
							name="Amount"
							type={"number-pad"}
						/>
						<MyInput
							value={reason}
							setValue={setReason}
							name="Reason"
						/>
						<View
							style={{
								paddingTop: FONT_SIZE * 0.8,
							}}
						>
							<Dropdown
								placeholder="Select Category"
								placeholderStyle={{
									fontSize: FONT_SIZE,
									color: disabledColor,
								}}
								selectedTextStyle={{
									fontSize: FONT_SIZE,
									color: primaryColor,
								}}
								data={[
									{ label: "Java", value: "Java" },
									{ label: "C++", value: ".NET" },
								]}
								labelField={"label"}
								valueField={"value"}
								onChange={() => {}}
								style={{
									alignSelf: "center",
									width: "90%",
									height: FONT_SIZE * 2.5,
									borderWidth: 2,
									borderRadius,
									padding,
									borderColor: primaryColor,
								}}
								itemTextStyle={{}}
							/>
						</View>
					</KeyboardAvoidingView>
				</View>
			</View>
		</Modal>
	);
};
export default AddTransactionModal;
