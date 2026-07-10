import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import {
	ALLOW_CLICK_SWITCH,
	ALLOW_SWIPE_SWITCH,
	APP_NAME,
} from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import type { HomeMode } from "@/types/HomeMode";
import { HOME_MODES } from "@/types/HomeMode";
import type { RootStackParamList } from "@/types/RootStackParamList";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

type HomeTile = Readonly<{
	label: string;
	subtitle: string;
	icon: ComponentProps<typeof Ionicons>["name"];
	color: string;
	handlePress: () => void;
}>;

type HomeModeOption = Readonly<{
	mode: HomeMode;
	label: string;
	icon: ComponentProps<typeof Ionicons>["name"];
}>;

const MODE_OPTIONS: readonly HomeModeOption[] = [
	{ mode: "TOOLS", label: "Tools", icon: "construct-outline" },
	{ mode: "FINANCE", label: "Finance", icon: "wallet-outline" },
	{ mode: "VAULT", label: "Vault", icon: "lock-closed-outline" },
];

const SWIPE_DOWN_THRESHOLD = 28;
const SWITCH_ARROW_TRAVEL = 5;

const getModeLabel = (mode: HomeMode): string =>
	MODE_OPTIONS.find((option) => option.mode === mode)?.label ?? "Tools";

const HomeScreen = ({ navigation }: HomeScreenProps): React.JSX.Element => {
	const [mode, setMode] = useState<HomeMode>("TOOLS");
	const [isModeMenuVisible, setIsModeMenuVisible] = useState(false);
	const [switchDragProgress] = useState(() => new Animated.Value(0));

	const cycleMode = useCallback((): void => {
		setMode((currentMode) => {
			const currentIndex = HOME_MODES.indexOf(currentMode);
			const nextIndex = (currentIndex + 1) % HOME_MODES.length;
			return HOME_MODES[nextIndex] ?? "TOOLS";
		});
		setIsModeMenuVisible(false);
	}, []);

	const updateSwitchDragProgress = useCallback(
		(translationX: number, translationY: number): void => {
			const isDownward =
				translationY > 0 &&
				Math.abs(translationY) > Math.abs(translationX);
			const progress = isDownward
				? Math.min(translationY / SWIPE_DOWN_THRESHOLD, 1)
				: 0;
			switchDragProgress.setValue(progress);
		},
		[switchDragProgress],
	);

	const resetSwitchDragProgress = useCallback((): void => {
		Animated.spring(switchDragProgress, {
			toValue: 0,
			useNativeDriver: true,
			speed: 24,
			bounciness: 8,
		}).start();
	}, [switchDragProgress]);

	const switchGesture = useMemo(
		() =>
			Gesture.Pan()
				.enabled(ALLOW_SWIPE_SWITCH)
				.minDistance(4)
				.runOnJS(true)
				.onUpdate((event) => {
					updateSwitchDragProgress(
						event.translationX,
						event.translationY,
					);
				})
				.onEnd((event) => {
					if (
						event.translationY >= SWIPE_DOWN_THRESHOLD &&
						Math.abs(event.translationY) >
							Math.abs(event.translationX)
					) {
						cycleMode();
					}
					resetSwitchDragProgress();
				})
				.onFinalize(() => {
					resetSwitchDragProgress();
				}),
		[cycleMode, resetSwitchDragProgress, updateSwitchDragProgress],
	);

	const upArrowStyle = useMemo(
		() => ({
			transform: [
				{
					translateY: switchDragProgress.interpolate({
						inputRange: [0, 1],
						outputRange: [0, -SWITCH_ARROW_TRAVEL],
					}),
				},
			],
		}),
		[switchDragProgress],
	);

	const downArrowStyle = useMemo(
		() => ({
			transform: [
				{
					translateY: switchDragProgress.interpolate({
						inputRange: [0, 1],
						outputRange: [0, SWITCH_ARROW_TRAVEL],
					}),
				},
			],
		}),
		[switchDragProgress],
	);

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
					handlePress: () =>
						navigation.navigate("Relations", { kind: "SOURCE" }),
				},
				{
					label: "Categories",
					subtitle: "Income & expense",
					icon: "pricetags-outline",
					color: COLORS.warning,
					handlePress: () =>
						navigation.navigate("Relations", {
							kind: "CATEGORY",
						}),
				},
				{
					label: "Trips",
					subtitle: "Travel spending",
					icon: "airplane-outline",
					color: "#68D5FF",
					handlePress: () =>
						navigation.navigate("Relations", { kind: "TRIP" }),
				},
				{
					label: "Investments",
					subtitle: "Invested & redeemed",
					icon: "trending-up",
					color: COLORS.success,
					handlePress: () =>
						navigation.navigate("Relations", {
							kind: "INVESTMENT",
						}),
				},
				{
					label: "Budgets",
					subtitle: "Calendar targets",
					icon: "speedometer-outline",
					color: "#FF8FA3",
					handlePress: () => navigation.navigate("Budgets"),
				},
				{
					label: "Analysis",
					subtitle: "Category-driven",
					icon: "pie-chart-outline",
					color: "#C9A7FF",
					handlePress: () => navigation.navigate("Analysis"),
				},
				{
					label: "Exchange rates",
					subtitle: "Master INR rates",
					icon: "earth-outline",
					color: "#66E0C2",
					handlePress: () => navigation.navigate("ExchangeRates"),
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

	const handleSelectMode = (selectedMode: HomeMode): void => {
		setMode(selectedMode);
		setIsModeMenuVisible(false);
	};

	const handleSwitchPress = (): void => {
		if (ALLOW_CLICK_SWITCH) {
			setIsModeMenuVisible(true);
		}
	};

	const renderTiles = (tiles: readonly HomeTile[]): React.JSX.Element => (
		<View style={styles.grid}>
			{tiles.map((tile) => (
				<Pressable
					key={tile.label}
					onPress={tile.handlePress}
					style={({ pressed }) => [
						styles.tileWrapper,
						pressed && styles.pressed,
					]}
				>
					<GlassCard>
						<View style={styles.tile}>
							<View
								style={[
									styles.tileIcon,
									{ backgroundColor: `${tile.color}20` },
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
								<GestureDetector gesture={switchGesture}>
									<Pressable
										accessibilityLabel="Switch homepage"
										accessibilityRole="button"
										onPress={handleSwitchPress}
										style={({ pressed }) => [
											styles.switchButton,
											pressed && styles.pressed,
										]}
									>
										<View style={styles.switchGlyph}>
											<View style={styles.switchRail}>
												<View
													style={styles.switchRailDot}
												/>
											</View>
											<Animated.View
												style={[
													styles.switchArrowCap,
													styles.switchArrowTop,
													upArrowStyle,
												]}
											>
												<Ionicons
													color={COLORS.primaryBright}
													name="arrow-up"
													size={12}
												/>
											</Animated.View>
											<Animated.View
												style={[
													styles.switchArrowCap,
													styles.switchArrowBottom,
													downArrowStyle,
												]}
											>
												<Ionicons
													color={COLORS.primaryBright}
													name="arrow-down"
													size={12}
												/>
											</Animated.View>
										</View>
									</Pressable>
								</GestureDetector>
							</View>
						</View>
					</View>
					{renderTiles(tilesByMode[mode])}
				</ScreenContainer>
			</SafeAreaView>
			{ALLOW_CLICK_SWITCH ? (
				<Modal
					animationType="fade"
					onRequestClose={() => setIsModeMenuVisible(false)}
					transparent
					visible={isModeMenuVisible}
				>
					<Pressable
						onPress={() => setIsModeMenuVisible(false)}
						style={styles.menuOverlay}
					>
						<Pressable style={styles.modeMenu}>
							{MODE_OPTIONS.map((option) => {
								const isSelected = option.mode === mode;
								return (
									<Pressable
										key={option.mode}
										onPress={() =>
											handleSelectMode(option.mode)
										}
										style={[
											styles.modeOption,
											isSelected &&
												styles.modeOptionActive,
										]}
									>
										<View style={styles.modeOptionLeft}>
											<Ionicons
												color={
													isSelected
														? COLORS.primaryBright
														: COLORS.textMuted
												}
												name={option.icon}
												size={19}
											/>
											<CustomText
												style={[
													styles.modeOptionText,
													isSelected &&
														styles.modeOptionTextActive,
												]}
											>
												{option.label}
											</CustomText>
										</View>
										{isSelected ? (
											<Ionicons
												color={COLORS.primaryBright}
												name="checkmark-circle"
												size={19}
											/>
										) : null}
									</Pressable>
								);
							})}
						</Pressable>
					</Pressable>
				</Modal>
			) : null}
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		marginTop: -6,
		marginBottom: 8,
		gap: 8,
	},
	appName: {
		color: COLORS.text,
		fontSize: 36,
		fontWeight: "900",
		letterSpacing: 0,
	},
	modeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	modeName: {
		color: COLORS.primaryBright,
		flex: 1,
		fontSize: 30,
		fontWeight: "900",
		lineHeight: 36,
	},
	headerActions: {
		flexDirection: "row",
		flexShrink: 0,
		gap: 8,
	},
	switchButton: {
		width: 40,
		height: 40,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(197, 168, 255, 0.24)",
		backgroundColor: "rgba(168, 124, 255, 0.10)",
	},
	switchGlyph: {
		width: 22,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	switchRail: {
		width: 2,
		height: 22,
		borderRadius: 999,
		backgroundColor: "rgba(197, 168, 255, 0.22)",
		alignItems: "center",
		justifyContent: "center",
	},
	switchRailDot: {
		width: 5,
		height: 5,
		borderRadius: 999,
		backgroundColor: COLORS.primaryBright,
	},
	switchArrowCap: {
		position: "absolute",
		width: 18,
		height: 18,
		borderRadius: 9,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(197, 168, 255, 0.22)",
		backgroundColor: COLORS.backgroundElevated,
	},
	switchArrowTop: {
		top: 0,
	},
	switchArrowBottom: {
		bottom: 0,
	},
	grid: {
		flexDirection: "row",
		justifyContent: "space-between",
		flexWrap: "wrap",
		rowGap: 10,
	},
	tileWrapper: {
		width: "48.5%",
	},
	tile: {
		minHeight: 122,
		gap: 7,
	},
	tileIcon: {
		width: 42,
		height: 42,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 3,
	},
	tileTitle: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "900",
	},
	tileSubtitle: {
		color: COLORS.textMuted,
		fontSize: 11,
		lineHeight: 15,
	},
	pressed: {
		transform: [{ scale: 0.98 }],
	},
	menuOverlay: {
		flex: 1,
		alignItems: "flex-end",
		backgroundColor: "rgba(0,0,0,0.45)",
		paddingHorizontal: 16,
		paddingTop: 72,
	},
	modeMenu: {
		width: 220,
		borderRadius: 18,
		backgroundColor: COLORS.glassStrong,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
		padding: 8,
		gap: 2,
	},
	modeOption: {
		minHeight: 48,
		borderRadius: 13,
		paddingHorizontal: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
	},
	modeOptionActive: {
		backgroundColor: COLORS.primaryMuted,
	},
	modeOptionLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	modeOptionText: {
		color: COLORS.text,
		fontSize: 15,
		fontWeight: "800",
	},
	modeOptionTextActive: {
		color: COLORS.primaryBright,
	},
});

export { HomeScreen };
