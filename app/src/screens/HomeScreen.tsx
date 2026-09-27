import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNavBar from "@/components/BottomNavBar";
import GlassCard from "@/components/GlassCard";
import HeaderIconButton from "@/components/HeaderIconButton";
import ScreenContainer from "@/components/ScreenContainer";
import appConstants from "@/constants/appConstants";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type HomeMode from "@/types/HomeMode";
import type HomeModeOption from "@/types/HomeModeOption";
import type HomeScreenProps from "@/types/HomeScreenProps";
import type HomeTile from "@/types/HomeTile";
import type { ViewStyle } from "react-native";
const { APP_NAME } = appConstants;
const {
	ALIGN,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	LINE_HEIGHT,
	POSITION,
	RADIUS,
	SCALE,
	SIZES,
	SPACING,
} = styleConstants;

const MODE_OPTIONS: readonly HomeModeOption[] = [
	{ mode: "TOOLS", label: "Tools", icon: "construct-outline" },
	{ mode: "FINANCE", label: "Finance", icon: "wallet-outline" },
	{ mode: "VAULT", label: "Vault", icon: "lock-closed-outline" },
];

const getModeLabel = (mode: HomeMode): string =>
	MODE_OPTIONS.find((option) => option.mode === mode)?.label ?? "Tools";

const getPressableScaleStyle = (
	pressed: boolean,
): readonly (ViewStyle | false)[] => [pressed && styles.pressed];

const getTileIconBackgroundColor = (color: string): string => `${color}20`;

const HomeScreen = ({ navigation }: HomeScreenProps): React.JSX.Element => {
	const [mode, setMode] = useState<HomeMode>("FINANCE");

	const tilesByMode = useMemo(
		(): Readonly<Record<HomeMode, readonly HomeTile[]>> => ({
			TOOLS: [
				{
					label: "Notes",
					subtitle: "Capture details",
					icon: "document-text-outline",
					color: "#73B7FF",
					handlePress: () => navigation.navigate("Notes"),
				},
				{
					label: "Todos",
					subtitle: "Things to finish",
					icon: "checkbox-outline",
					color: COLORS.success,
					handlePress: () => navigation.navigate("Todos"),
				},
			],
			FINANCE: [
				{
					label: "Transactions",
					subtitle: "Money movements",
					icon: "swap-horizontal",
					color: COLORS.primary,
					handlePress: () => navigation.navigate("Transactions"),
				},
				{
					label: "Sources",
					subtitle: "Accounts & cards",
					icon: "wallet-outline",
					color: COLORS.blue,
					handlePress: () => navigation.navigate("Sources"),
				},
				{
					label: "Categories",
					subtitle: "Income & expense",
					icon: "pricetags-outline",
					color: COLORS.warning,
					handlePress: () => navigation.navigate("Categories"),
				},
				{
					label: "Trips",
					subtitle: "Travel spending",
					icon: "airplane-outline",
					color: "#68D5FF",
					handlePress: () => navigation.navigate("Trips"),
				},
				{
					label: "Investments",
					subtitle: "Invested & redeemed",
					icon: "trending-up",
					color: COLORS.success,
					handlePress: () => navigation.navigate("Investments"),
				},
				{
					label: "Analysis",
					subtitle: "Category-driven",
					icon: "pie-chart-outline",
					color: "#C9A7FF",
					handlePress: () => navigation.navigate("Analysis"),
				},
			],
			VAULT: [
				{
					label: "Passwords",
					subtitle: "Local credentials",
					icon: "key-outline",
					color: COLORS.warning,
					handlePress: () =>
						navigation.navigate("Vault", { kind: "PASSWORD" }),
				},
				{
					label: "Cards",
					subtitle: "Payment details",
					icon: "card-outline",
					color: "#FF8FA3",
					handlePress: () =>
						navigation.navigate("Vault", { kind: "CARD" }),
				},
				{
					label: "Identity",
					subtitle: "Personal records",
					icon: "person-circle-outline",
					color: COLORS.blue,
					handlePress: () =>
						navigation.navigate("Vault", { kind: "IDENTITY" }),
				},
			],
		}),
		[navigation],
	);

	const renderTiles = (tiles: readonly HomeTile[]): React.JSX.Element => (
		<View style={styles.grid}>
			{tiles.map((tile) => (
				<Pressable
					key={tile.label}
					onPress={tile.handlePress}
					style={({ pressed }) => [
						styles.tileWrapper,
						...getPressableScaleStyle(pressed),
					]}
				>
					<GlassCard>
						<View style={styles.tile}>
							<View
								style={[
									styles.tileIcon,
									{
										backgroundColor:
											getTileIconBackgroundColor(
												tile.color,
											),
									},
								]}
							>
								<Ionicons
									color={tile.color}
									name={tile.icon}
									size={24}
								/>
							</View>
							<CustomText style={styles.tileTitle}>
								{tile.label}
							</CustomText>
							<CustomText style={styles.tileSubtitle}>
								{tile.subtitle}
							</CustomText>
						</View>
					</GlassCard>
				</Pressable>
			))}
		</View>
	);

	return (
		<LinearGradient
			colors={[COLORS.background, "#171029", COLORS.background]}
			style={styles.background}
		>
			<SafeAreaView style={styles.safeArea}>
				<ScreenContainer>
					<View style={styles.header}>
						<CustomText numberOfLines={1} style={styles.appName}>
							{APP_NAME}
						</CustomText>
						<View style={styles.modeRow}>
							<CustomText style={styles.modeName}>
								{getModeLabel(mode)}
							</CustomText>
							<View style={styles.headerActions}>
								<HeaderIconButton
									accessibilityLabel={`Search ${getModeLabel(mode)}`}
									icon="search-outline"
									onPress={() =>
										navigation.navigate("GlobalSearch", {
											mode,
										})
									}
								/>
								<HeaderIconButton
									accessibilityLabel="Settings"
									icon="settings-outline"
									onPress={() =>
										navigation.navigate("Settings")
									}
								/>
							</View>
						</View>
					</View>
					{renderTiles(tilesByMode[mode])}
				</ScreenContainer>
				<View style={styles.navDock}>
					<BottomNavBar
						activeMode={mode}
						onSelectMode={setMode}
						options={MODE_OPTIONS}
					/>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: FLEX.FILL,
	},
	safeArea: {
		flex: FLEX.FILL,
	},
	header: {
		marginTop: SPACING.N6,
		marginBottom: SPACING.S8,
		gap: SPACING.S8,
	},
	appName: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S36,
		fontWeight: FONT_WEIGHT.BLACK,
		letterSpacing: LETTER_SPACING.NONE,
	},
	modeRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.SPACE_BETWEEN,
		gap: SPACING.S12,
	},
	modeName: {
		color: COLORS.primaryBright,
		flex: FLEX.FILL,
		fontSize: FONT_SIZE.S30,
		fontWeight: FONT_WEIGHT.BLACK,
		lineHeight: LINE_HEIGHT.S36,
	},
	headerActions: {
		flexDirection: FLEX.ROW,
		flexShrink: FLEX.NONE,
		gap: SPACING.S8,
	},
	grid: {
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.SPACE_BETWEEN,
		flexWrap: FLEX.WRAP,
		rowGap: SPACING.S10,
	},
	navDock: {
		position: POSITION.ABSOLUTE,
		left: SPACING.S16,
		right: SPACING.S16,
		bottom: SPACING.S10,
	},
	tileWrapper: {
		width: SIZES.TILE,
	},
	tile: {
		minHeight: SIZES.S122,
		gap: SPACING.S7,
	},
	tileIcon: {
		width: SIZES.S42,
		height: SIZES.S42,
		borderRadius: RADIUS.S14,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		marginBottom: SPACING.S3,
	},
	tileTitle: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
		fontWeight: FONT_WEIGHT.BLACK,
	},
	tileSubtitle: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S11,
		lineHeight: LINE_HEIGHT.S15,
	},
	pressed: {
		transform: [{ scale: SCALE.GENTLE }],
	},
});

export default HomeScreen;

export {
	getModeLabel,
	getPressableScaleStyle,
	getTileIconBackgroundColor,
	MODE_OPTIONS,
};
