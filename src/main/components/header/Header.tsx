import { useRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/config/constants.config";
import CheckButton from "../button/header/CheckButton";
import CloseButton from "../button/header/CloseButton";
import DeleteButton from "../button/header/DeleteButton";
import EditButton from "../button/header/EditButton";
import FindButton from "../button/header/FindButton";
import PlusButton from "../button/header/PlusButton";
import CustomText from "../text/CustomText";

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
				<FindButton onClick={handleFind} bottom={MARGIN / 1.5} />
				<CheckButton onClick={handleSubmit} enabled={canBeSubmitted} />
				<PlusButton onClick={handlePlus} />
				<EditButton onClick={handleEdit} />
				<DeleteButton
					onDelete={handleDelete}
					canBeDeleted={canBeDeleted}
				/>
				<CloseButton onClick={handleClose} />
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
