import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
	BACKGROUND_COLOR,
	PRIMARY_COLOR,
} from "../../../constants/config/colors.config";
import {
	CENTER,
	FONT_SIZE,
	MARGIN,
} from "../../../constants/config/constants.config";
import ConfirmationModal from "./ConfirmationModal";

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
					<ConfirmationModal
						setModal={setModal}
						onDelete={onDelete}
					/>
				)}
			</TouchableOpacity>
		)
	);
};

const styles = StyleSheet.create({
	deleteButton: {
		backgroundColor: PRIMARY_COLOR,
		paddingHorizontal: 6,
		borderRadius: MARGIN,
		height: FONT_SIZE * 1.8,
		alignSelf: CENTER,
		justifyContent: CENTER,
	},
});

export default DeleteButton;
