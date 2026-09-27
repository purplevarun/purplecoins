import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, View } from "react-native";

import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import type BottomNavBarProps from "@/types/BottomNavBarProps";
import type IconName from "@/types/IconName";

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
		overflow: "hidden",
		borderRadius: 30,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.glass,
		shadowColor: COLORS.black,
		shadowOpacity: 0.35,
		shadowRadius: 24,
		shadowOffset: { width: 0, height: 12 },
		elevation: 6,
	},
	blur: {
		backgroundColor: COLORS.glass,
	},
	bar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 6,
		gap: 4,
	},
	item: {
		flex: 1,
		alignItems: "center",
	},
	itemPressed: {
		transform: [{ scale: 0.96 }],
	},
	itemContent: {
		alignItems: "center",
		justifyContent: "center",
		gap: 3,
		paddingHorizontal: 18,
		paddingVertical: 8,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: COLORS.transparent,
	},
	itemContentActive: {
		backgroundColor: COLORS.primaryMuted,
		borderColor: COLORS.borderStrong,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 11,
		fontWeight: "800",
	},
	labelActive: {
		color: COLORS.primaryBright,
	},
});

export default BottomNavBar;
