import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import COLORS from "@/constants/colors";

type FloatingAddButtonProps = Readonly<{
	onPress: () => void;
}>;

const FloatingAddButton = ({
	onPress,
}: FloatingAddButtonProps): React.JSX.Element => (
	<Pressable
		accessibilityLabel="Add"
		onPress={onPress}
		style={({ pressed }) => [styles.button, pressed && styles.pressed]}
	>
		<Ionicons color={COLORS.background} name="add" size={30} />
	</Pressable>
);

const styles = StyleSheet.create({
	button: {
		position: "absolute",
		right: 20,
		bottom: 24,
		width: 60,
		height: 60,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primary,
		borderWidth: 1,
		borderColor: COLORS.primaryBright,
		elevation: 8,
		shadowColor: COLORS.primary,
		shadowOpacity: 0.35,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 8 },
	},
	pressed: {
		transform: [{ scale: 0.95 }],
	},
});

export default FloatingAddButton;
