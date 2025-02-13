import { useRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { transactionRoutes } from "../app/router/Routes";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../constants/constants.config";
import useScreen from "../hooks/useScreen";
import CustomText from "./CustomText";
import CheckButton from "./buttons/header/CheckButton";
import CloseButton from "./buttons/header/CloseButton";
import DeleteButton from "./buttons/header/DeleteButton";
import EditButton from "./buttons/header/EditButton";
import FindButton from "./buttons/header/FindButton";
import InfoButton from "./buttons/header/InfoButton";
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
	const navigation = useScreen();
	return (
		<View style={styles.headerContainer}>
			<CustomText
				text={name}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<View style={styles.iconContainer}>
				{name === transactionRoutes.main && (
					<InfoButton
						onClick={() => navigation(transactionRoutes.analysis)}
					/>
				)}
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
