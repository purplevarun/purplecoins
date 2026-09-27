import CustomTextInput from "@/components/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type SearchBarProps from "@/types/SearchBarProps";

const SearchBar = ({
	value,
	onChangeText,
	placeholder = "Search...",
	autoFocus = true,
}: SearchBarProps): React.JSX.Element => (
	<View style={styles.container}>
		<Ionicons
			color={COLORS.textDim}
			name="search-outline"
			size={16}
			style={styles.icon}
		/>
		<CustomTextInput
			autoFocus={autoFocus}
			onChangeText={onChangeText}
			placeholder={placeholder}
			style={styles.input}
			value={value}
		/>
	</View>
);

const { ALIGN, BORDER, FLEX, FONT_SIZE, RADIUS, SPACING } = styleConstants;

const styles = StyleSheet.create({
	container: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		backgroundColor: COLORS.surfaceHigh,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		borderRadius: RADIUS.S12,
		paddingHorizontal: SPACING.S10,
		marginBottom: SPACING.S8,
	},
	icon: {
		marginRight: SPACING.S6,
	},
	input: {
		flex: FLEX.FILL,
		paddingVertical: SPACING.S10,
		fontSize: FONT_SIZE.S14,
		color: COLORS.text,
	},
});

export default SearchBar;
