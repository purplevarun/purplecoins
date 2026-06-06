import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import type { SelectOption } from "@/types/SelectOption";

type SegmentedControlProps = Readonly<{
	value: string;
	options: readonly SelectOption[];
	onChange: (value: string) => void;
}>;

const SegmentedControl = ({
	value,
	options,
	onChange,
}: SegmentedControlProps): React.JSX.Element => (
	<View style={styles.container}>
		{options.map((option) => {
			const isSelected = option.value === value;
			return (
				<Pressable
					key={option.value}
					onPress={() => onChange(option.value)}
					style={[styles.option, isSelected && styles.selectedOption]}
				>
					<Text
						style={[
							styles.label,
							isSelected && styles.selectedLabel,
						]}
					>
						{option.label}
					</Text>
				</Pressable>
			);
		})}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		padding: 4,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.035)",
		gap: 4,
	},
	option: {
		flex: 1,
		minHeight: 42,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 8,
	},
	selectedOption: {
		backgroundColor: COLORS.primaryMuted,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 13,
		fontWeight: "700",
	},
	selectedLabel: {
		color: COLORS.primaryBright,
	},
});

export { SegmentedControl };
