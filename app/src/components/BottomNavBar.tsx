import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, View } from "react-native";

import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type BottomNavBarProps from "@/types/BottomNavBarProps";
import type IconName from "@/types/IconName";

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	OVERFLOW,
	RADIUS,
	SCALE,
	SHADOW,
	SPACING,
} = styleConstants;

const getActiveIconName = (icon: IconName): IconName =>
	icon.replace(/-outline$/, "") as IconName;

const BottomNavBar = ({
	options,
	activeMode,
	onSelectMode,
}: BottomNavBarProps): React.JSX.Element => (
	<View style={styles.dock}>
		<BlurView intensity={40} style={styles.blur} tint="dark">
			<View style={styles.bar}>
				{options.map((option) => {
					const isActive = option.mode === activeMode;
					return (
						<Pressable
							accessibilityLabel={option.label}
							accessibilityRole="tab"
							accessibilityState={{ selected: isActive }}
							key={option.mode}
							onPress={() => onSelectMode(option.mode)}
							style={({ pressed }) => [
								styles.item,
								pressed && styles.itemPressed,
							]}
						>
							<View
								style={[
									styles.itemContent,
									isActive && styles.itemContentActive,
								]}
							>
								<Ionicons
									color={
										isActive
											? COLORS.primaryBright
											: COLORS.textMuted
									}
									name={
										isActive
											? getActiveIconName(option.icon)
											: option.icon
									}
									size={22}
								/>
								<CustomText
									style={[
										styles.label,
										isActive && styles.labelActive,
									]}
								>
									{option.label}
								</CustomText>
							</View>
						</Pressable>
					);
				})}
			</View>
		</BlurView>
	</View>
);

const styles = StyleSheet.create({
	dock: {
		overflow: OVERFLOW.HIDDEN,
		borderRadius: RADIUS.S30,
		borderWidth: BORDER.THICK,
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.glass,
		shadowColor: COLORS.black,
		shadowOpacity: SHADOW.OPACITY,
		shadowRadius: SHADOW.RADIUS_XL,
		shadowOffset: { width: SHADOW.OFFSET_X, height: SHADOW.OFFSET_Y_LG },
		elevation: SHADOW.ELEVATION_MID,
	},
	blur: {
		backgroundColor: COLORS.glass,
	},
	bar: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.SPACE_BETWEEN,
		padding: SPACING.S4,
		gap: SPACING.S4,
	},
	item: {
		flex: FLEX.FILL,
		alignItems: ALIGN.CENTER,
	},
	itemPressed: {
		transform: [{ scale: SCALE.LIGHT }],
	},
	itemContent: {
		alignItems: ALIGN.CENTER,
		alignSelf: FLEX.STRETCH,
		justifyContent: ALIGN.CENTER,
		gap: SPACING.S3,
		paddingHorizontal: SPACING.S8,
		paddingVertical: SPACING.S5,
		borderRadius: RADIUS.S22,
		borderWidth: BORDER.THICK,
		borderColor: COLORS.transparent,
	},
	itemContentActive: {
		backgroundColor: COLORS.primaryMuted,
		borderColor: COLORS.borderStrong,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S11,
		fontWeight: FONT_WEIGHT.HEAVY,
	},
	labelActive: {
		color: COLORS.primaryBright,
	},
});

export default BottomNavBar;
