import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "./colors.config";
import { CENTER, LARGE_FONT_SIZE, MARGIN } from "./constants.config";

const FilterButton = ({ onClick }: { onClick?: () => void }) => (
	<TouchableOpacity
		style={{ alignSelf: CENTER, bottom: MARGIN / 1.5, right: MARGIN * 2 }}
		onPress={onClick}
		disabled={false}
		testID={"filter_icon"}
	>
		<FontAwesome6
			name="filter"
			size={LARGE_FONT_SIZE * 1.4}
			color={PRIMARY_COLOR}
		/>
	</TouchableOpacity>
);

export default FilterButton;
