import appConstants from "@/constants/appConstants";

import CustomText from "@/components/CustomText";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import packageJson from "../../package.json";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SelectField from "@/components/SelectField";
import COLORS from "@/constants/colors";
import dateConstants from "@/constants/dateConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import backupService from "@/services/backupService";
import settingsService from "@/services/settingsService";
import sourceService from "@/services/sourceService";
import tripService from "@/services/tripService";
import updateService from "@/services/updateService";
import type SelectOption from "@/types/SelectOption";
import type SettingsScreenProps from "@/types/SettingsScreenProps";
import type Source from "@/types/Source";
import type Trip from "@/types/Trip";
import getErrorMessage from "@/utils/error";
const { APP_NAME } = appConstants;
const { version } = packageJson;
const { exportBackup, restoreBackup } = backupService;
const {
	getDefaultSourceId,
	getDefaultTripId,
	getFyStartMonth,
	getNativeCurrencyDisplay,
	updateDefaultSourceId,
	updateDefaultTripId,
	updateFyStartMonth,
	updateNativeCurrencyDisplay,
} = settingsService;
const { getSources } = sourceService;
const { getTrips } = tripService;
const { checkForUpdate, downloadAndInstallUpdate, isUpdateDownloaded } =
	updateService;

const { DEFAULT_FY_START_MONTH, MONTH_OPTIONS } = dateConstants;

const getFyEndMonthLabel = (startMonth: number): string => {
	const endMonth = startMonth === 1 ? 12 : startMonth - 1;
	return MONTH_OPTIONS[endMonth - 1]?.label ?? "Mar";
};

const SettingsScreen = ({
	navigation,
}: SettingsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [fyStartMonth, setFyStartMonth] = useState(DEFAULT_FY_START_MONTH);
	const [defaultTripId, setDefaultTripId] = useState("");
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [defaultSourceId, setDefaultSourceId] = useState("");
	const [sources, setSources] = useState<readonly Source[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		const getSettings = async (): Promise<void> => {
			const [native, fy, tripId, loadedTrips, sourceId, loadedSources] =
				await Promise.all([
					getNativeCurrencyDisplay(database),
					getFyStartMonth(database),
					getDefaultTripId(database),
					getTrips(database),
					getDefaultSourceId(database),
					getSources(database),
				]);
			setIsNativeCurrency(native);
			setFyStartMonth(fy);
			setDefaultTripId(tripId ?? "");
			setTrips(loadedTrips);
			setDefaultSourceId(sourceId ?? "");
			setSources(loadedSources);
		};
		void getSettings().catch((caughtError: unknown) => {
			setError(getErrorMessage(caughtError));
		});
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

	const handleDefaultSourceChange = async (value: string): Promise<void> => {
		setError("");
		try {
			await updateDefaultSourceId(database, value || null);
			setDefaultSourceId(value);
			refreshData();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
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

	const handleCheckForUpdate = async (): Promise<void> => {
		setIsUpdating(true);
		setError("");
		setMessage("");
		try {
			const release = await checkForUpdate(version);
			if (!release) {
				setMessage(
					`You are already on the latest version (${version}).`,
				);
				return;
			}
			const isDownloaded = isUpdateDownloaded(release);
			dialog.confirm({
				title: isDownloaded
					? "Update ready to install"
					: "Update available",
				message: isDownloaded
					? `Version ${release.version} is already downloaded and ready to install.`
					: `Version ${release.version} is ready to download and install.`,
				confirmLabel: isDownloaded ? "Install" : "Update",
				onConfirm: () => {
					const processUpdate = async (): Promise<void> => {
						setError("");
						setMessage("");
						setIsUpdating(true);
						try {
							await downloadAndInstallUpdate(release);
							setMessage(
								"The Android installer has been opened.",
							);
						} catch (caughtError: unknown) {
							setError(getErrorMessage(caughtError));
						} finally {
							setIsUpdating(false);
						}
					};
					void processUpdate();
				},
			});
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsUpdating(false);
		}
	};

	const tripOptions: readonly SelectOption[] = [
		{ label: "None", value: "" },
		...trips.map((t) => ({ label: t.name, value: t.id })),
	];

	const sourceOptions: readonly SelectOption[] = [
		{ label: "None", value: "" },
		...sources.map((source) => ({
			label: source.name,
			value: source.id,
			description: source.currencyCode,
		})),
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
						Track every penny
					</CustomText>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>App update</CustomText>
					<CustomText style={styles.description}>
						Check GitHub for the latest Purplecoins APK. APKs are
						saved in this app&apos;s private cache, not Downloads.
						Android may ask you to allow installs from Purplecoins.
					</CustomText>
					<AppButton
						icon="cloud-download-outline"
						isLoading={isUpdating}
						label="Check for update"
						onPress={() => void handleCheckForUpdate()}
					/>
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
						onChange={(value) =>
							void handleFyStartMonthChange(value)
						}
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
						label="Default source"
						onChange={(value) =>
							void handleDefaultSourceChange(value)
						}
						options={sourceOptions}
						placeholder="No default source"
						value={defaultSourceId}
					/>
					<SelectField
						isOptional
						label="Default trip"
						onChange={(value) =>
							void handleDefaultTripChange(value)
						}
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
					<CustomText style={styles.heading}>Relations</CustomText>
					<CustomText style={styles.description}>
						Sources, categories, trips and investments that have
						been archived can be found and restored here.
					</CustomText>
					<AppButton
						icon="archive-outline"
						label="Archived relations"
						onPress={() => navigation.navigate("ArchivedRelations")}
						variant="secondary"
					/>
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

export default SettingsScreen;
