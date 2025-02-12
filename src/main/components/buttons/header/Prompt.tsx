import { FC } from "react";
import { Modal, StyleSheet, View } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
	SECONDARY_COLOR,
	SHADOW_COLOR,
} from "../../../constants/colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FLEX_ONE,
	FLEX_ROW,
	FONT_SIZE,
	MODAL_HEIGHT,
	MODAL_WIDTH,
	SPACE_EVENLY,
} from "../../../constants/constants.config";
import CustomInput from "../../CustomInput";
import CustomButton from "../CustomButton";

const Prompt: IDeleteModal = ({ setModal, text, setText }) => {
	return (
		<Modal transparent>
			<View style={styles.modalOverlay}>
				<View
					style={{
						width: MODAL_WIDTH,
						backgroundColor: DISABLED_COLOR,
						borderRadius: BORDER_RADIUS,
					}}
				>
					<CustomInput
						name={"Search"}
						value={text}
						setValue={setText}
					/>
					<CustomButton
						text={"Search"}
						onPress={() => setModal(false)}
					/>
				</View>
				{/*<View style={styles.modalContent}>*/}
				{/*</View>*/}
			</View>
		</Modal>
	);
};

type IDeleteModal = FC<{
	setModal: (value: boolean) => void;
	text: string;
	setText: (value: string) => void;
}>;

const styles = StyleSheet.create({
	modalOverlay: {
		flex: FLEX_ONE,
		alignItems: CENTER,
		justifyContent: CENTER,
		backgroundColor: SHADOW_COLOR,
	},
	modalContent: {
		alignItems: CENTER,
		backgroundColor: SECONDARY_COLOR,
		width: MODAL_WIDTH,
		height: MODAL_HEIGHT,
		justifyContent: SPACE_EVENLY,
		borderRadius: FONT_SIZE,
		borderWidth: BORDER_WIDTH,
		borderColor: PRIMARY_COLOR,
	},
	buttonContainer: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_EVENLY,
		width: "100%",
	},
});

export default Prompt;
