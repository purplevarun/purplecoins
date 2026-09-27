import CustomText from "@/components/CustomText";
import { Pressable, StyleSheet, View, type DimensionValue } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type SegmentedControlProps from "@/types/SegmentedControlProps";

const SegmentedControl = ({
	value,
	options,
	onChange,
	labelNumberOfLines = 1,
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
							numberOfLines={labelNumberOfLines}
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

const { ALIGN, BORDER, FLEX, FONT_SIZE, FONT_WEIGHT, RADIUS, SIZES, SPACING } =
	styleConstants;

const styles = StyleSheet.create({
	container: {
		flexDirection: FLEX.ROW,
		flexWrap: FLEX.WRAP,
		padding: SPACING.S4,
		borderRadius: RADIUS.S16,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surfaceSoft,
		gap: SPACING.S4,
	},
	option: {
		flexGrow: FLEX.FILL,
		minWidth: SIZES.S0,
		minHeight: SIZES.S42,
		borderRadius: RADIUS.S12,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		paddingHorizontal: SPACING.S8,
	},
	selectedOption: {
		backgroundColor: COLORS.primaryMuted,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.borderStrong,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S13,
		fontWeight: FONT_WEIGHT.BOLD,
		textAlign: ALIGN.CENTER,
	},
	selectedLabel: {
		color: COLORS.primaryBright,
	},
});

export default SegmentedControl;
