import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "../constants/constants.config";
import ScreenType from "../constants/enums/ScreenType";
import Service from "../constants/enums/Service";
import useScreen from "../hooks/useScreen";
import CustomText from "./CustomText";
import CheckButton from "./buttons/header/CheckButton";
import CloseButton from "./buttons/header/CloseButton";
import DeleteButton from "./buttons/header/DeleteButton";
import EditButton from "./buttons/header/EditButton";
import PlusButton from "./buttons/header/PlusButton";

const Header = ({
	handleClose,
	handlePlus,
	handleEdit,
	handleDelete,
	canBeDeleted,
	handleSubmit,
	canBeSubmitted,
}: {
	handleClose?: () => void;
	handlePlus?: () => void;
	handleEdit?: () => void;
	handleDelete?: () => void;
	handleSubmit?: () => void;
	canBeDeleted?: boolean;
	canBeSubmitted?: boolean;
}) => {
	const { serviceName, screenType } = useScreen();

	const title = useMemo(() => {
		switch (screenType) {
			case ScreenType.MAIN:
				return serviceName === Service.CATEGORY
					? "Categories"
					: `${serviceName}s`;
			case ScreenType.ADD:
				return `Add ${serviceName}`;
			case ScreenType.EDIT:
				return `Edit ${serviceName}`;
			case ScreenType.DETAIL:
				return `${serviceName} Details`;
			default:
				return "Settings";
		}
	}, [serviceName, screenType]);

	return (
		<View style={styles.headerContainer}>
			<CustomText
				text={title}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<View style={styles.iconContainer}>
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
