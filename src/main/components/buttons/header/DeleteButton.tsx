import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FC, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import {
	BACKGROUND_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
	SHADOW_COLOR,
} from "../../../constants/colors.config";
import {
	BORDER_WIDTH,
	CENTER,
	FLEX_ONE,
	FLEX_ROW,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MARGIN,
	MODAL_BUTTON_WIDTH,
	MODAL_HEIGHT,
	MODAL_WIDTH,
	SPACE_EVENLY,
} from "../../../constants/constants.config";
import CustomText from "../../CustomText";
import Vertical from "../../Vertical";
import CustomButton from "../CustomButton";

const DeleteButton = ({
	onDelete,
	canBeDeleted,
}: {
	onDelete?: () => void;
	canBeDeleted?: boolean;
}) => {
	const [modal, setModal] = useState(false);
	return (
		onDelete &&
		canBeDeleted && (
			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => setModal(true)}
			>
				<FontAwesome
					name={"trash"}
					size={FONT_SIZE * 1.5}
					color={BACKGROUND_COLOR}
					alignSelf={CENTER}
					testID={"delete_icon"}
				/>
				{modal && (
					<DeleteModal setModal={setModal} onDelete={onDelete} />
				)}
			</TouchableOpacity>
		)
	);
};

const DeleteModal: IDeleteModal = ({ setModal, onDelete }) => {
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
	deleteButton: {
		backgroundColor: PRIMARY_COLOR,
		paddingHorizontal: 6,
		borderRadius: MARGIN,
		height: FONT_SIZE * 1.8,
		alignSelf: CENTER,
		justifyContent: CENTER,
	},
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

export default DeleteButton;
