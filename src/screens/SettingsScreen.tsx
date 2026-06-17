import { version } from "@/../package.json";
import { CustomText } from "@/components/CustomText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SelectField } from "@/components/SelectField";
import { APP_NAME } from "@/constants/appConstants";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { exportBackup, restoreBackup } from "@/services/backupService";
import {
	getDefaultTripId,
	getFyStartMonth,
	getNativeCurrencyDisplay,
	updateDefaultTripId,
	updateFyStartMonth,
	updateNativeCurrencyDisplay,
} from "@/services/settingsService";
import { getTrips } from "@/services/tripService";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { SelectOption } from "@/types/SelectOption";
import type { Trip } from "@/types/Trip";
import { getErrorMessage } from "@/utils/error";

type SettingsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Settings"
>;

const MONTH_OPTIONS: readonly SelectOption[] = [
	{ label: "Jan", value: "1" },
	{ label: "Feb", value: "2" },
	{ label: "Mar", value: "3" },
	{ label: "Apr", value: "4" },
	{ label: "May", value: "5" },
	{ label: "Jun", value: "6" },
	{ label: "Jul", value: "7" },
	{ label: "Aug", value: "8" },
	{ label: "Sep", value: "9" },
	{ label: "Oct", value: "10" },
	{ label: "Nov", value: "11" },
	{ label: "Dec", value: "12" },
];

const getFyEndMonthLabel = (startMonth: number): string => {
	const endMonth = startMonth === 1 ? 12 : startMonth - 1;
	return MONTH_OPTIONS[endMonth - 1]?.label ?? "Mar";
};

const SettingsScreen = (_props: SettingsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [fyStartMonth, setFyStartMonth] = useState(4);
	const [defaultTripId, setDefaultTripId] = useState("");
	const [trips, setTrips] = useState<readonly Trip[]>([]);

	useEffect(() => {
		const getSettings = async (): Promise<void> => {
			const [native, fy, tripId, loadedTrips] = await Promise.all([
				getNativeCurrencyDisplay(database),
				getFyStartMonth(database),
				getDefaultTripId(database),
				getTrips(database),
			]);
			setIsNativeCurrency(native);
			setFyStartMonth(fy);
			setDefaultTripId(tripId ?? "");
			setTrips(loadedTrips);
		};
		void getSettings();
	}, [database]);

	const handleCurrencyToggle = async (value: boolean): Promise<void> => {
		setIsNativeCurrency(value);
		await updateNativeCurrencyDisplay(database, value);
		refreshData();
	};

	const handleFyStartMonthChange = async (value: string): Promise<void> => {
		const month = parseInt(value, 10);
		setFyStartMonth(month);
		await updateFyStartMonth(database, month);
		refreshData();
	};

	const handleDefaultTripChange = async (value: string): Promise<void> => {
		setDefaultTripId(value);
		await updateDefaultTripId(database, value || null);
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

	const tripOptions: readonly SelectOption[] = [
		{ label: "None", value: "" },
		...trips.map((t) => ({ label: t.name, value: t.id })),
	];

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
						Configuration
					</CustomText>
					<SelectField
						label="Financial year start month"
						onChange={handleFyStartMonthChange}
						options={MONTH_OPTIONS}
						value={String(fyStartMonth)}
					/>
					<CustomText style={styles.fyEndHint}>
						FY ends in{" "}
						<CustomText style={styles.fyEndValue}>
							{getFyEndMonthLabel(fyStartMonth)}
						</CustomText>
					</CustomText>
					<SelectField
						isOptional
						label="Default trip"
						onChange={handleDefaultTripChange}
						options={tripOptions}
						placeholder="No default trip"
						value={defaultTripId}
					/>
					<CustomText style={styles.switchDescription}>
						When set, new transactions will have this trip
						pre-filled.
					</CustomText>
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
	fyEndHint: {
		color: COLORS.textMuted,
		fontSize: 12,
		marginTop: -6,
	},
	fyEndValue: {
		color: COLORS.primaryBright,
		fontWeight: "800",
	},
});

export { SettingsScreen };
