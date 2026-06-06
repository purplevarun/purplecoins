import { version } from "@/../package.json";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { APP_NAME } from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { exportBackup, restoreBackup } from "@/services/backupService";
import {
	getNativeCurrencyDisplay,
	updateNativeCurrencyDisplay,
} from "@/services/settingsService";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { getErrorMessage } from "@/utils/error";

type SettingsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Settings"
>;

const SettingsScreen = (_props: SettingsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const getSettings = async (): Promise<void> => {
			setIsNativeCurrency(await getNativeCurrencyDisplay(database));
		};
		void getSettings();
	}, [database]);

	const handleCurrencyToggle = async (value: boolean): Promise<void> => {
		setIsNativeCurrency(value);
		await updateNativeCurrencyDisplay(database, value);
		refreshData();
	};

	const handleExport = async (): Promise<void> => {
		setIsWorking(true);
		setError("");
		setMessage("");
		try {
			await exportBackup(database);
			setMessage("Backup prepared successfully.");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsWorking(false);
		}
	};

	const handleRestore = (): void => {
		Alert.alert(
			"Restore backup?",
			"This replaces every record currently stored in Gringotts.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Choose backup",
					style: "destructive",
					onPress: () => {
						const processRestore = async (): Promise<void> => {
							setIsWorking(true);
							setError("");
							setMessage("");
							try {
								const wasRestored =
									await restoreBackup(database);
								if (wasRestored) {
									refreshData();
									setMessage("Backup restored successfully.");
								}
							} catch (caughtError: unknown) {
								setError(getErrorMessage(caughtError));
							} finally {
								setIsWorking(false);
							}
						};
						void processRestore();
					},
				},
			],
		);
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.brand}>
					<Text style={styles.appName}>{APP_NAME}</Text>
					<Text style={styles.version}>Version {version}</Text>
					<Text style={styles.description}>
						Local-first finance, tools and vault. No account and no
						cloud dependency.
					</Text>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<Text style={styles.heading}>Currency display</Text>
					<View style={styles.switchRow}>
						<View style={styles.switchDetails}>
							<Text style={styles.switchTitle}>
								Native currencies
							</Text>
							<Text style={styles.switchDescription}>
								On shows totals per source currency. Off
								converts analysis and categories to INR.
							</Text>
						</View>
						<Switch
							onValueChange={(value) =>
								void handleCurrencyToggle(value)
							}
							value={isNativeCurrency}
						/>
					</View>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<Text style={styles.heading}>Backup and restore</Text>
					<Text style={styles.description}>
						A .gringotts file is a plain, complete SQLite snapshot,
						including attachments. Keep it somewhere private.
					</Text>
					<AppButton
						icon="share-outline"
						isLoading={isWorking}
						label="Export .gringotts"
						onPress={() => void handleExport()}
					/>
					<AppButton
						icon="download-outline"
						isDisabled={isWorking}
						label="Restore .gringotts"
						onPress={handleRestore}
						variant="secondary"
					/>
				</View>
			</GlassCard>
			<Notice
				message="Supabase sync is intentionally excluded from Phase 1."
				tone="info"
			/>
			{message ? <Notice message={message} /> : null}
			{error ? <Notice message={error} tone="danger" /> : null}
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	brand: {
		gap: 5,
	},
	appName: {
		color: COLORS.text,
		fontSize: 25,
		fontWeight: "900",
	},
	version: {
		color: COLORS.primaryBright,
		fontSize: 12,
		fontWeight: "800",
	},
	description: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 19,
	},
	section: {
		gap: 14,
	},
	heading: {
		color: COLORS.text,
		fontSize: 17,
		fontWeight: "900",
	},
	switchRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	switchDetails: {
		flex: 1,
		gap: 3,
	},
	switchTitle: {
		color: COLORS.text,
		fontSize: 14,
		fontWeight: "800",
	},
	switchDescription: {
		color: COLORS.textMuted,
		fontSize: 11,
		lineHeight: 16,
	},
});

export { SettingsScreen };
