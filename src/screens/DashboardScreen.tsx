import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeading } from "@/components/SectionHeading";
import { APP_NAME } from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import type { RootStackParamList } from "@/types/RootStackParamList";

type DashboardScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Dashboard"
>;

type DashboardTile = Readonly<{
	label: string;
	subtitle: string;
	icon: React.ComponentProps<typeof Ionicons>["name"];
	color: string;
	handlePress: () => void;
}>;

const DashboardScreen = ({
	navigation,
}: DashboardScreenProps): React.JSX.Element => {
	const financeTiles: readonly DashboardTile[] = [
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
				navigation.navigate("Relations", { kind: "CATEGORY" }),
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
				navigation.navigate("Relations", { kind: "INVESTMENT" }),
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
	];
	const toolTiles: readonly DashboardTile[] = [
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
	];
	const vaultTiles: readonly DashboardTile[] = [
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
			handlePress: () => navigation.navigate("Vault", { kind: "CARD" }),
		},
		{
			label: "Identity",
			subtitle: "Personal records",
			icon: "person-circle-outline",
			color: COLORS.blue,
			handlePress: () =>
				navigation.navigate("Vault", { kind: "IDENTITY" }),
		},
	];

	const renderTiles = (
		tiles: readonly DashboardTile[],
	): React.JSX.Element => (
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
						<View>
							<CustomText style={styles.eyebrow}>
								YOUR PRIVATE LEDGER
							</CustomText>
							<CustomText style={styles.appName}>
								{APP_NAME}
							</CustomText>
							<CustomText style={styles.tagline}>
								Every coin accounted for.
							</CustomText>
						</View>
						<View style={styles.headerActions}>
							<HeaderIconButton
								accessibilityLabel="Global search"
								icon="search-outline"
								onPress={() =>
									navigation.navigate("GlobalSearch")
								}
							/>
							<HeaderIconButton
								accessibilityLabel="Settings"
								icon="settings-outline"
								onPress={() => navigation.navigate("Settings")}
							/>
						</View>
					</View>
					<SectionHeading
						subtitle="Transactions, balances, planning and insight."
						title="Finance"
					/>
					{renderTiles(financeTiles)}
					<SectionHeading
						subtitle="Useful things beyond the ledger."
						title="Tools"
					/>
					{renderTiles(toolTiles)}
					<SectionHeading
						subtitle="Sensitive records stored only on this phone."
						title="Vault"
					/>
					{renderTiles(vaultTiles)}
				</ScreenContainer>
			</SafeAreaView>
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginTop: 8,
		marginBottom: 8,
	},
	eyebrow: {
		color: COLORS.primaryBright,
		fontSize: 11,
		fontWeight: "900",
		letterSpacing: 1.8,
	},
	appName: {
		color: COLORS.text,
		fontSize: 34,
		fontWeight: "900",
		letterSpacing: -1.2,
		marginTop: 3,
	},
	tagline: {
		color: COLORS.textMuted,
		fontSize: 14,
		marginTop: 2,
	},
	headerActions: {
		flexDirection: "row",
		gap: 8,
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
});

export { DashboardScreen };
