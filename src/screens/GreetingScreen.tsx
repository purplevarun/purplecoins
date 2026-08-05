import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GlassCard from "@/components/GlassCard";
import ScreenContainer from "@/components/ScreenContainer";
import COLORS from "@/constants/colors";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import settingsService from "@/services/settingsService";
import type HomeMode from "@/types/HomeMode";
import type RootStackParamList from "@/types/RootStackParamList";

const { getUsername } = settingsService;

type GreetingScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Greeting"
>;

type LandingTile = Readonly<{
	label: string;
	subtitle: string;
	mode: HomeMode;
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
}>;

const TILES: readonly LandingTile[] = [
	{
		label: "Finance",
		subtitle: "Transactions, budgets, analysis",
		mode: "FINANCE",
		icon: "wallet-outline",
		color: COLORS.primary,
	},
	{
		label: "Tools",
		subtitle: "Notes and todos",
		mode: "TOOLS",
		icon: "construct-outline",
		color: COLORS.success,
	},
	{
		label: "Vault",
		subtitle: "Passwords, cards, identity",
		mode: "VAULT",
		icon: "lock-closed-outline",
		color: COLORS.warning,
	},
];

const GreetingScreen = ({
	navigation,
}: GreetingScreenProps): React.JSX.Element => {
	const { database } = useDatabaseContext();
	const [username, setUsername] = useState("");
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const loadUsername = async (): Promise<void> => {
			setUsername(await getUsername(database));
		};
		void loadUsername();
	}, [database]);

	const greetingName = username.trim() ? username.trim() : "Guest";
	const dateText = useMemo(
		() =>
			now.toLocaleDateString("en-IN", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		[now],
	);
	const timeText = useMemo(
		() =>
			now.toLocaleTimeString("en-IN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}),
		[now],
	);

	return (
		<LinearGradient
			colors={[COLORS.background, "#201433", COLORS.background]}
			style={styles.background}
		>
			<SafeAreaView style={styles.safeArea}>
				<ScreenContainer>
					<View style={styles.header}>
						<View style={styles.headerTopRow}>
							<CustomText style={styles.greeting}>
								Hello {greetingName}
							</CustomText>
							<Pressable
								accessibilityLabel="Greeting settings"
								onPress={() => navigation.navigate("Settings")}
								testID="greeting-settings-button"
								style={({ pressed }) => [
									styles.settingsButton,
									pressed && styles.pressed,
								]}
							>
								<Ionicons
									color={COLORS.text}
									name="settings-outline"
									size={22}
								/>
							</Pressable>
						</View>
						<CustomText style={styles.dateText}>
							{dateText}
						</CustomText>
						<CustomText style={styles.timeText}>
							{timeText}
						</CustomText>
					</View>
					<View style={styles.grid}>
						{TILES.map((tile) => (
							<Pressable
								key={tile.label}
								onPress={() =>
									navigation.replace("Home", {
										mode: tile.mode,
									})
								}
								style={({ pressed }) => [
									styles.tilePressable,
									pressed && styles.pressed,
								]}
							>
								<GlassCard>
									<View style={styles.tile}>
										<View
											style={[
												styles.tileIcon,
												{
													backgroundColor: `${tile.color}22`,
												},
											]}
										>
											<Ionicons
												color={tile.color}
												name={tile.icon}
												size={28}
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
	settingsButton: {
		width: 42,
		height: 42,
		borderRadius: 13,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255,255,255,0.08)",
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	header: {
		gap: 8,
		marginBottom: 10,
	},
	headerTopRow: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	greeting: {
		color: COLORS.text,
		fontSize: 38,
		fontWeight: "900",
		flexShrink: 1,
	},
	dateText: {
		color: COLORS.textMuted,
		fontSize: 14,
	},
	timeText: {
		color: COLORS.primaryBright,
		fontSize: 26,
		fontWeight: "900",
	},
	grid: {
		gap: 10,
	},
	tilePressable: {
		borderRadius: 18,
	},
	pressed: {
		opacity: 0.85,
	},
	tile: {
		gap: 10,
	},
	tileIcon: {
		width: 52,
		height: 52,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	tileTitle: {
		color: COLORS.text,
		fontSize: 22,
		fontWeight: "900",
	},
	tileSubtitle: {
		color: COLORS.textMuted,
		fontSize: 13,
	},
});

export default GreetingScreen;
