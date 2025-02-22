import { useRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import CheckButton from "./CheckButton";
import CloseButton from "./CloseButton";
import CustomText from "./CustomText";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import FilterButton from "./FilterButton";
import FindButton from "./FindButton";
import PlusButton from "./PlusButton";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const Header = ({
	handleClose,
	handlePlus,
	handleEdit,
	handleDelete,
	canBeDeleted,
	handleSubmit,
	canBeSubmitted,
	handleFind,
	handleFilter,
}: {
	handleClose?: () => void;
	handlePlus?: () => void;
	handleEdit?: () => void;
	handleDelete?: () => void;
	handleSubmit?: () => void;
	canBeDeleted?: boolean;
	canBeSubmitted?: boolean;
	handleFind?: () => void;
	handleFilter?: () => void;
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
				{!name.includes("Transaction") && (
					<FilterButton onClick={handleFilter} />
				)}
				<FindButton onClick={handleFind} />
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
