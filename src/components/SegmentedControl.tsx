import { CustomText } from "@/components/CustomText";
import { Pressable, StyleSheet, View, type DimensionValue } from "react-native";

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
}: SegmentedControlProps): React.JSX.Element => {
	const columnCount = Math.min(Math.max(options.length, 1), 3);
	const basis = `${100 / columnCount - 3}%` as DimensionValue;

	return (
		<View style={styles.container}>
			{options.map((option) => {
				const isSelected = option.value === value;

				return (
					<Pressable
						key={option.value}
						onPress={() => onChange(option.value)}
						style={[
							styles.option,
							{ flexBasis: basis },
							isSelected && styles.selectedOption,
						]}
					>
						<CustomText
							numberOfLines={1}
							style={[
								styles.label,
								isSelected && styles.selectedLabel,
							]}
						>
							{option.label}
						</CustomText>
					</Pressable>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		flexWrap: "wrap",
		padding: 4,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.035)",
		gap: 4,
	},
	option: {
		flexGrow: 1,
		minWidth: 0,
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
