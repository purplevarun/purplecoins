import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "@/constants/colors";

type CurrencyToggleProps = Readonly<{
	isNativeCurrency: boolean;
	onToggle: () => void;
}>;

const CurrencyToggle = ({
	isNativeCurrency,
	onToggle,
}: CurrencyToggleProps): React.JSX.Element => (
	<Pressable
		onPress={onToggle}
		style={[styles.container, isNativeCurrency && styles.activeContainer]}
	>
		<Ionicons
			color={isNativeCurrency ? COLORS.primaryBright : COLORS.textMuted}
			name="earth"
			size={18}
		/>
		<CustomText
			style={[styles.label, isNativeCurrency && styles.activeLabel]}
		>
			{isNativeCurrency ? "Native currencies" : "Converted to INR"}
		</CustomText>
	</Pressable>
);

const styles = StyleSheet.create({
	container: {
		minHeight: 42,
		paddingHorizontal: 13,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.045)",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	activeContainer: {
		backgroundColor: COLORS.primaryMuted,
		borderColor: COLORS.borderStrong,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "800",
	},
	activeLabel: {
		color: COLORS.primaryBright,
	},
});

export { CurrencyToggle };
