import { version } from "@/../package.json";
import { CustomText } from "@/components/CustomText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { APP_NAME } from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
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
	const dialog = useAppDialog();
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
		dialog.confirm({
			title: "Restore backup?",
			message:
				"This replaces every record currently stored on this phone.",
			confirmLabel: "Choose backup",
			variant: "danger",
			onConfirm: () => {
				const processRestore = async (): Promise<void> => {
					setIsWorking(true);
					setError("");
					setMessage("");
					try {
						const wasRestored = await restoreBackup(database);
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
		});
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.brand}>
					<CustomText style={styles.appName}>{APP_NAME}</CustomText>
					<CustomText style={styles.version}>
						Version {version}
					</CustomText>
					<CustomText style={styles.description}>
						Local-first finance, tools and vault. No account and no
						cloud dependency.
					</CustomText>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>
						Currency display
					</CustomText>
					<View style={styles.switchRow}>
						<View style={styles.switchDetails}>
							<CustomText style={styles.switchTitle}>
								Native currencies
							</CustomText>
							<CustomText style={styles.switchDescription}>
								On shows totals per source currency. Off
								converts category and investment totals to INR.
							</CustomText>
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
					<CustomText style={styles.heading}>
						Backup and restore
					</CustomText>
					<CustomText style={styles.description}>
						A .purplecoins file is a plain, complete SQLite
						snapshot, including attachments. Keep it somewhere
						private.
					</CustomText>
					<AppButton
						icon="share-outline"
						isLoading={isWorking}
						label="Export .purplecoins"
						onPress={() => void handleExport()}
					/>
					<AppButton
						icon="download-outline"
						isDisabled={isWorking}
						label="Restore .purplecoins"
						onPress={handleRestore}
						variant="secondary"
					/>
				</View>
			</GlassCard>
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
