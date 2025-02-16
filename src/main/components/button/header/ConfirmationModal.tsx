import { FC } from "react";
import { Modal, StyleSheet, View } from "react-native";
import {
	PRIMARY_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
	SHADOW_COLOR,
} from "../../../constants/config/colors.config";
import {
	BORDER_WIDTH,
	CENTER,
	FLEX_ONE,
	FLEX_ROW,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MODAL_BUTTON_WIDTH,
	MODAL_HEIGHT,
	MODAL_WIDTH,
	SPACE_EVENLY,
} from "../../../constants/config/constants.config";
import Vertical from "../../layout/Vertical";
import CustomText from "../../text/CustomText";
import CustomButton from "../CustomButton";

const ConfirmationModal: IDeleteModal = ({ setModal, onDelete }) => {
	return (
		<Modal transparent>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<Vertical />
					<CustomText
						text={"Confirm Delete"}
						alignSelf={CENTER}
						fontSize={LARGE_FONT_SIZE}
					/>
					<View style={styles.buttonContainer}>
						<CustomButton
							text={"Yes"}
							width={MODAL_BUTTON_WIDTH}
							color={RED_COLOR}
							onPress={() => {
								setModal(false);
								onDelete();
							}}
						/>
						<CustomButton
							text={"No"}
							width={MODAL_BUTTON_WIDTH}
							onPress={() => setModal(false)}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
};

type IDeleteModal = FC<{
	setModal: (value: boolean) => void;
	onDelete: () => void;
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

export default ConfirmationModal;
