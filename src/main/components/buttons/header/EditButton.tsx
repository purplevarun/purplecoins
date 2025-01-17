import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../constants/colors.config";
import { CENTER, LARGE_FONT_SIZE } from "../../../constants/constants.config";

const EditButton = ({ handleEdit }: { handleEdit?: () => void }) =>
	handleEdit && (
		<TouchableOpacity
			style={{ alignSelf: CENTER }}
			onPress={handleEdit}
			testID={"edit_icon"}
		>
			<FontAwesome
				name="pencil-square"
				size={LARGE_FONT_SIZE * 1.5}
				color={PRIMARY_COLOR}
			/>
		</TouchableOpacity>
	);

export default EditButton;
