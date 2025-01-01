import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import DeleteButton from "./DeleteButton";
import { PRIMARY_COLOR } from "./colors.config";
import {
	CENTER,
	FLEX_ROW,
	HEADER_HEIGHT,
	LARGE_FONT_SIZE,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const Header = ({
	title,
	navigateToMainScreen,
	navigateToAddScreen,
	handleEdit,
	handleDelete,
}: {
	title: string;
	navigateToMainScreen?: () => void;
	navigateToAddScreen?: () => void;
	handleEdit?: () => void;
	handleDelete?: () => void;
}) => {
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
				fontSize={LARGE_FONT_SIZE * 1.2}
			/>
			{navigateToAddScreen && (
				<TouchableOpacity
					style={{ alignSelf: CENTER }}
					onPress={navigateToAddScreen}
				>
					<FontAwesome
						name="plus"
						size={LARGE_FONT_SIZE * 1.6}
						color={PRIMARY_COLOR}
					/>
				</TouchableOpacity>
			)}
			{navigateToMainScreen && (
				<TouchableOpacity
					style={{ alignSelf: CENTER }}
					onPress={navigateToMainScreen}
				>
					<FontAwesome
						name="close"
						size={LARGE_FONT_SIZE * 1.6}
						color={PRIMARY_COLOR}
					/>
				</TouchableOpacity>
			)}
			{handleEdit && handleDelete && (
				<View
					style={{
						flexDirection: FLEX_ROW,
						justifyContent: SPACE_BETWEEN,
						gap: PADDING / 2,
					}}
				>
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
					<DeleteButton onDelete={handleDelete} />
				</View>
			)}
		</View>
	);
};

export default Header;
