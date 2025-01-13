import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import DeleteButton from "./DeleteButton";
import IScreenType from "./IScreenType";
import IServiceName from "./IServiceName";
import { CheckIcon, CloseIcon, EditIcon, PlusIcon } from "./Icons";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import useScreen from "./useScreen";

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
			case IScreenType.main:
				return serviceName === IServiceName.category
					? "Categories"
					: `${serviceName}s`;
			case IScreenType.add:
				return `Add ${serviceName}`;
			case IScreenType.edit:
				return `Edit ${serviceName}`;
			case IScreenType.detail:
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
				<CheckIcon
					handleCheck={handleSubmit}
					enabled={canBeSubmitted}
				/>
				<PlusIcon handlePlus={handlePlus} />
				<EditIcon handleEdit={handleEdit} />
				<DeleteButton
					onDelete={handleDelete}
					canBeDeleted={canBeDeleted}
				/>
				<CloseIcon handleClose={handleClose} />
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
