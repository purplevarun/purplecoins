import { TouchableOpacity, Image } from "react-native";
import { FONT_SIZE } from "../config/Constants";
import { FC } from "react";
import { useRealm } from "@realm/react";
import uuid from "react-native-uuid";
import useTransaction from "../stores/TransactionStore";

interface AddBtnProps {
	bottom: number;
}

const AddButton: FC<AddBtnProps> = ({ bottom }) => {
	const realm = useRealm();
	const { toggleAddTransactionModal } = useTransaction();

	return (
		<TouchableOpacity
			style={{
				position: "absolute",
				right: FONT_SIZE / 2,
				bottom,
			}}
			onPress={toggleAddTransactionModal}
		>
			<Image
				source={require("./../assets/add.png")}
				style={{ width: FONT_SIZE * 2.5, height: FONT_SIZE * 2.5 }}
			/>
		</TouchableOpacity>
	);
};

export default AddButton;
