import { useRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "../constants/constants.config";
import CustomText from "./CustomText";
import CheckButton from "./buttons/header/CheckButton";
import CloseButton from "./buttons/header/CloseButton";
import DeleteButton from "./buttons/header/DeleteButton";
import EditButton from "./buttons/header/EditButton";
import FindButton from "./buttons/header/FindButton";
import PlusButton from "./buttons/header/PlusButton";

const Header = ({
	handleClose,
	handlePlus,
	handleEdit,
	handleDelete,
	canBeDeleted,
	handleSubmit,
	canBeSubmitted,
	handleFind,
}: {
	handleClose?: () => void;
	handlePlus?: () => void;
	handleEdit?: () => void;
	handleDelete?: () => void;
	handleSubmit?: () => void;
	canBeDeleted?: boolean;
	canBeSubmitted?: boolean;
	handleFind?: () => void;
}) => {
	const { name } = useRoute();
	return (
		<View style={styles.headerContainer}>
			<CustomText
				text={name}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<View style={styles.iconContainer}>
				<FindButton onClick={handleFind} />
				<CheckButton
					handleCheck={handleSubmit}
					enabled={canBeSubmitted}
				/>
				<PlusButton handlePlus={handlePlus} />
				<EditButton handleEdit={handleEdit} />
				<DeleteButton
					onDelete={handleDelete}
					canBeDeleted={canBeDeleted}
				/>
				<CloseButton handleClose={handleClose} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		height: HEADER_HEIGHT,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
	iconContainer: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
		gap: PADDING / 2,
	},
});

export default Header;
