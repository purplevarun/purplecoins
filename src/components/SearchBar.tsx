import { CustomTextInput } from "@/components/CustomTextInput";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/colors";

type SearchBarProps = Readonly<{
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	autoFocus?: boolean;
}>;

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

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.06)",
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 12,
		paddingHorizontal: 10,
		marginBottom: 8,
	},
	icon: {
		marginRight: 6,
	},
	input: {
		flex: 1,
		paddingVertical: 10,
		fontSize: 14,
		color: COLORS.text,
	},
});

export { SearchBar };
