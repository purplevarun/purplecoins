import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ListHeader, ScreenList } from "@/components/ScreenList";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { deleteCard, getCards } from "@/services/cardService";
import { deleteIdentity, getIdentities } from "@/services/identityService";
import { deletePassword, getPasswords } from "@/services/passwordService";
import type { CardEntry } from "@/types/CardEntry";
import type { IdentityEntry } from "@/types/IdentityEntry";
import type { PasswordEntry } from "@/types/PasswordEntry";
import type { RootStackParamList } from "@/types/RootStackParamList";
import type { VaultKind } from "@/types/VaultKind";
import { formatDate } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";

type VaultScreenProps = NativeStackScreenProps<RootStackParamList, "Vault">;

type VaultListItem =
	| { kind: "PASSWORD"; entry: PasswordEntry }
	| { kind: "CARD"; entry: CardEntry }
	| { kind: "IDENTITY"; entry: IdentityEntry };

const CARD_TYPE_LABEL: Record<string, string> = {
	CREDIT_CARD: "Credit card",
	DEBIT_CARD: "Debit card",
};

const CopyRow = ({
	label,
	value,
	onCopy,
}: {
	label: string;
	value: string;
	onCopy: (value: string, label: string) => void;
}): React.JSX.Element | null => {
	if (!value) return null;
	return (
		<View style={styles.copyRow}>
			<View style={styles.copyDetails}>
				<CustomText style={styles.copyLabel}>{label}</CustomText>
				<CustomText style={styles.copyValue}>{value}</CustomText>
			</View>
			<Pressable
				onPress={() => onCopy(value, label)}
				style={styles.copyBtn}
			>
				<Ionicons
					color={COLORS.primaryBright}
					name="copy-outline"
					size={16}
				/>
			</Pressable>
		</View>
	);
};

const VaultScreen = ({
	navigation,
	route,
}: VaultScreenProps): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const { kind } = route.params;
	const [passwords, setPasswords] = useState<readonly PasswordEntry[]>([]);
	const [cards, setCards] = useState<readonly CardEntry[]>([]);
	const [identities, setIdentities] = useState<readonly IdentityEntry[]>([]);
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			if (kind === "PASSWORD") {
				setPasswords(await getPasswords(database));
			} else if (kind === "CARD") {
				setCards(await getCards(database));
			} else {
				setIdentities(await getIdentities(database));
			}
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, kind]);

	useEffect(() => {
		void getScreenData();
	}, [dataVersion, getScreenData]);

	const handleCopy = useCallback(
		async (value: string, label: string): Promise<void> => {
			await Clipboard.setStringAsync(value);
			setMessage(`${label} copied.`);
		},
		[],
	);

	const handleDelete = useCallback(
		(id: string, label: string, vaultKind: VaultKind): void => {
			dialog.confirm({
				title: `Delete ${label}?`,
				message: "This action cannot be undone.",
				confirmLabel: "Delete",
				variant: "danger",
				onConfirm: () => {
					const processDelete = async (): Promise<void> => {
						try {
							if (vaultKind === "PASSWORD") {
								await deletePassword(database, id);
							} else if (vaultKind === "CARD") {
								await deleteCard(database, id);
							} else {
								await deleteIdentity(database, id);
							}
							refreshData();
						} catch (caughtError: unknown) {
							setError(getErrorMessage(caughtError));
						}
					};
					void processDelete();
				},
			});
		},
		[database, dialog, refreshData],
	);

	const normalizedSearch = search.trim().toLowerCase();
	const listData = useMemo((): readonly VaultListItem[] => {
		if (kind === "PASSWORD") {
			return passwords
				.filter((entry) =>
					`${entry.title} ${entry.username} ${entry.website}`
						.toLowerCase()
						.includes(normalizedSearch),
				)
				.map((entry) => ({ kind: "PASSWORD" as const, entry }));
		}
		if (kind === "CARD") {
			return cards
				.filter((entry) =>
					`${entry.name} ${entry.network} ${entry.cardNumber} ${entry.cardType}`
						.toLowerCase()
						.includes(normalizedSearch),
				)
				.map((entry) => ({ kind: "CARD" as const, entry }));
		}
		return identities
			.filter((entry) =>
				`${entry.title} ${entry.idNumber}`
					.toLowerCase()
					.includes(normalizedSearch),
			)
			.map((entry) => ({ kind: "IDENTITY" as const, entry }));
	}, [cards, identities, kind, normalizedSearch, passwords]);

	const renderVaultItem = useCallback(
		({ item }: { item: VaultListItem }): React.JSX.Element => {
			if (item.kind === "PASSWORD") {
				const entry = item.entry;
				return (
					<Pressable
						onPress={() =>
							navigation.navigate("VaultForm", {
								kind: "PASSWORD",
								entryId: entry.id,
							})
						}
					>
						<GlassCard>
							<View style={styles.headingRow}>
								<Ionicons
									color={COLORS.warning}
									name="key-outline"
									size={22}
								/>
								<View style={styles.details}>
									<CustomText style={styles.title}>
										{entry.title}
									</CustomText>
									<CustomText style={styles.meta}>
										{entry.username ||
											entry.website ||
											"No username"}
									</CustomText>
									<CustomText style={styles.updatedAt}>
										Updated {formatDate(entry.updatedAt)}
									</CustomText>
								</View>
							</View>
							<View style={styles.actions}>
								<AppButton
									icon="copy-outline"
									isCompact
									label="Copy password"
									onPress={() =>
										void handleCopy(
											entry.password,
											"Password",
										)
									}
									variant="secondary"
								/>
								<AppButton
									icon="trash-outline"
									isCompact
									label="Delete"
									onPress={() =>
										handleDelete(
											entry.id,
											entry.title,
											"PASSWORD",
										)
									}
									variant="danger"
								/>
							</View>
						</GlassCard>
					</Pressable>
				);
			}
			if (item.kind === "CARD") {
				const entry = item.entry;
				return (
					<Pressable
						onPress={() =>
							navigation.navigate("VaultForm", {
								kind: "CARD",
								entryId: entry.id,
							})
						}
					>
						<GlassCard>
							<View style={styles.headingRow}>
								<Ionicons
									color={COLORS.danger}
									name="card-outline"
									size={23}
								/>
								<View style={styles.details}>
									<CustomText style={styles.title}>
										{entry.name}
									</CustomText>
									<CustomText style={styles.meta}>
										{CARD_TYPE_LABEL[entry.cardType] ??
											entry.cardType}
										{entry.network
											? ` · ${entry.network}`
											: ""}
									</CustomText>
								</View>
								{entry.hasAttachment ? (
									<Ionicons
										color={COLORS.primaryBright}
										name="attach"
										size={16}
									/>
								) : null}
							</View>
							<View style={styles.cardFields}>
								<CopyRow
									label="Card number"
									onCopy={(v, l) => void handleCopy(v, l)}
									value={entry.cardNumber}
								/>
								{entry.expiry ? (
									<View style={styles.copyRow}>
										<View style={styles.copyDetails}>
											<CustomText
												style={styles.copyLabel}
											>
												Expiry
											</CustomText>
											<CustomText
												style={styles.copyValue}
											>
												{entry.expiry}
											</CustomText>
										</View>
									</View>
								) : null}
								<CopyRow
									label="CVV"
									onCopy={(v, l) => void handleCopy(v, l)}
									value={entry.cvv}
								/>
								<CopyRow
									label="PIN"
									onCopy={(v, l) => void handleCopy(v, l)}
									value={entry.pin}
								/>
							</View>
							<View style={styles.actions}>
								<AppButton
									icon="trash-outline"
									isCompact
									label="Delete"
									onPress={() =>
										handleDelete(
											entry.id,
											entry.name,
											"CARD",
										)
									}
									variant="danger"
								/>
							</View>
						</GlassCard>
					</Pressable>
				);
			}
			const entry = item.entry;
			return (
				<Pressable
					onPress={() =>
						navigation.navigate("VaultForm", {
							kind: "IDENTITY",
							entryId: entry.id,
						})
					}
				>
					<GlassCard>
						<View style={styles.headingRow}>
							<Ionicons
								color={COLORS.blue}
								name="person-circle-outline"
								size={24}
							/>
							<View style={styles.details}>
								<CustomText style={styles.title}>
									{entry.title}
								</CustomText>
								<CustomText style={styles.meta}>
									{entry.idNumber || "No ID number"}
								</CustomText>
							</View>
							{entry.hasAttachment ? (
								<Ionicons
									color={COLORS.primaryBright}
									name="attach"
									size={16}
								/>
							) : null}
						</View>
						<View style={styles.actions}>
							<AppButton
								icon="trash-outline"
								isCompact
								label="Delete"
								onPress={() =>
									handleDelete(
										entry.id,
										entry.title,
										"IDENTITY",
									)
								}
								variant="danger"
							/>
						</View>
					</GlassCard>
				</Pressable>
			);
		},
		[handleCopy, handleDelete, navigation],
	);

	const listHeader = useMemo(
		() => (
			<ListHeader>
				<TextField
					label="Search"
					onChangeText={setSearch}
					placeholder="Search vault"
					value={search}
				/>
				{message ? <Notice message={message} /> : null}
				{error ? <Notice message={error} tone="danger" /> : null}
			</ListHeader>
		),
		[error, message, search],
	);

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="lock-closed-outline"
				message="Add your first local vault entry."
				title="Nothing here yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={listData}
				keyExtractor={(item) => item.entry.id}
				renderItem={renderVaultItem}
			/>
			<FloatingAddButton
				onPress={() => navigation.navigate("VaultForm", { kind })}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	headingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 11,
	},
	details: {
		flex: 1,
		gap: 3,
	},
	title: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "900",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
	updatedAt: {
		color: COLORS.textDim,
		fontSize: 11,
		marginTop: 2,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
		marginTop: 13,
	},
	cardFields: {
		marginTop: 12,
		gap: 8,
	},
	copyRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	copyDetails: {
		flex: 1,
		gap: 2,
	},
	copyLabel: {
		color: COLORS.textDim,
		fontSize: 10,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	copyValue: {
		color: COLORS.text,
		fontSize: 14,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
	},
	copyBtn: {
		padding: 8,
	},
});

export { VaultScreen };
