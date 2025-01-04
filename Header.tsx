import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import DeleteButton from "./DeleteButton";
import ScreenType from "./ScreenType";
import { PRIMARY_COLOR } from "./colors.config";
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
}: {
	handleClose?: () => void;
	handlePlus?: () => void;
	handleEdit?: () => void;
	handleDelete?: () => void;
	canBeDeleted?: boolean;
}) => {
	const { serviceName, screenType } = useScreen();
	const title = useMemo(() => {
		if (screenType === ScreenType.main) return serviceName + "s";
		else if (screenType === ScreenType.add) return "Add " + serviceName;
		else if (screenType === ScreenType.edit) return "Edit " + serviceName;
		else if (screenType === ScreenType.detail)
			return serviceName + " Details";
		else return "Settings";
	}, [serviceName, screenType]);
	return (
		<View
			style={{
				height: HEADER_HEIGHT,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
		>
			<CustomText
				text={title}
				alignSelf={CENTER}
				fontSize={
					title.length > 15 ? LARGE_FONT_SIZE : LARGE_FONT_SIZE * 1.2
				}
			/>
			<View
				style={{
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
					gap: PADDING / 2,
				}}
			>
				{handlePlus && (
					<TouchableOpacity
						style={{ alignSelf: CENTER }}
						onPress={handlePlus}
					>
						<FontAwesome
							name="plus"
							size={LARGE_FONT_SIZE * 1.6}
							color={PRIMARY_COLOR}
						/>
					</TouchableOpacity>
				)}
				{handleEdit && (
					<TouchableOpacity
						style={{ alignSelf: CENTER }}
						onPress={handleEdit}
					>
						<FontAwesome
							name="pencil-square"
							size={LARGE_FONT_SIZE * 1.5}
							color={PRIMARY_COLOR}
						/>
					</TouchableOpacity>
				)}
				{handleDelete && canBeDeleted && (
					<DeleteButton onDelete={handleDelete} />
				)}
				{handleClose && (
					<TouchableOpacity
						style={{ alignSelf: CENTER, bottom: 1 }}
						onPress={handleClose}
					>
						<FontAwesome
							name="close"
							size={LARGE_FONT_SIZE * 1.6}
							color={PRIMARY_COLOR}
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default Header;
