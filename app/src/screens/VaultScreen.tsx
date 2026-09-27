import CustomText from "@/components/CustomText";
import type CopyRowProps from "@/types/CopyRowProps";
import type ListItemProps from "@/types/ListItemProps";
import type VaultFormParams from "@/types/VaultFormParams";

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import TextField from "@/components/TextField";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import cardService from "@/services/cardService";
import identityService from "@/services/identityService";
import passwordService from "@/services/passwordService";
import type CardEntry from "@/types/CardEntry";
import type IdentityEntry from "@/types/IdentityEntry";
import type PasswordEntry from "@/types/PasswordEntry";
import type VaultKind from "@/types/VaultKind";
import type VaultListItem from "@/types/VaultListItem";
import type VaultScreenProps from "@/types/VaultScreenProps";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import runAfterRender from "@/utils/runAfterRender";
const { deleteCard, getCards } = cardService;
const { deleteIdentity, getIdentities } = identityService;
const { deletePassword, getPasswords } = passwordService;
const { formatDate } = dateUtils;

const CARD_TYPE_LABEL: Record<string, string> = {
	CREDIT_CARD: "Credit card",
	DEBIT_CARD: "Debit card",
};

const getVaultFormParams = (
	kind: VaultKind,
	entryId?: string,
): VaultFormParams => (entryId ? { kind, entryId } : { kind });

const getPasswordSubtitle = (username: string, website: string): string =>
	username || website || "No username";

const getCardSubtitle = (cardType: string, network: string): string =>
	`${CARD_TYPE_LABEL[cardType] ?? cardType}${network ? ` · ${network}` : ""}`;

const getIdentitySubtitle = (idNumber: string): string =>
	idNumber || "No ID number";

const getVaultListData = (
	kind: VaultKind,
	passwords: readonly PasswordEntry[],
	cards: readonly CardEntry[],
	identities: readonly IdentityEntry[],
	normalizedSearch: string,
): readonly VaultListItem[] => {
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
};

const CopyRow = ({
	label,
	value,
	onCopy,
}: CopyRowProps): React.JSX.Element | null => {
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

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

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
	const listData = useMemo(
		(): readonly VaultListItem[] =>
			getVaultListData(
				kind,
				passwords,
				cards,
				identities,
				normalizedSearch,
			),
		[cards, identities, kind, normalizedSearch, passwords],
	);

	const renderVaultItem = useCallback(
		({ item }: ListItemProps<VaultListItem>): React.JSX.Element => {
			if (item.kind === "PASSWORD") {
				const entry = item.entry;
				return (
					<Pressable
						onPress={() =>
							navigation.navigate(
								"VaultForm",
								getVaultFormParams("PASSWORD", entry.id),
							)
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
										{getPasswordSubtitle(
											entry.username,
											entry.website,
										)}
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
							navigation.navigate(
								"VaultForm",
								getVaultFormParams("CARD", entry.id),
							)
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
										{getCardSubtitle(
											entry.cardType,
											entry.network,
										)}
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
						navigation.navigate(
							"VaultForm",
							getVaultFormParams("IDENTITY", entry.id),
						)
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
									{getIdentitySubtitle(entry.idNumber)}
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
				onPress={() =>
					navigation.navigate("VaultForm", getVaultFormParams(kind))
				}
			/>
		</View>
	);
};

const {
	ALIGN,
	FLEX,
	FONT_SIZE,
	FONT_VARIANT,
	FONT_WEIGHT,
	LETTER_SPACING,
	SPACING,
	TEXT_TRANSFORM,
} = styleConstants;

const styles = StyleSheet.create({
	screen: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.background,
	},
	headingRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S11,
	},
	details: {
		flex: FLEX.FILL,
		gap: SPACING.S3,
	},
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S16,
		fontWeight: FONT_WEIGHT.BLACK,
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
	},
	updatedAt: {
		color: COLORS.textDim,
		fontSize: FONT_SIZE.S11,
		marginTop: SPACING.S2,
	},
	actions: {
		flexDirection: FLEX.ROW,
		justifyContent: ALIGN.END,
		gap: SPACING.S8,
		marginTop: SPACING.S13,
	},
	cardFields: {
		marginTop: SPACING.S12,
		gap: SPACING.S8,
	},
	copyRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S8,
	},
	copyDetails: {
		flex: FLEX.FILL,
		gap: SPACING.S2,
	},
	copyLabel: {
		color: COLORS.textDim,
		fontSize: FONT_SIZE.S10,
		fontWeight: FONT_WEIGHT.BOLD,
		textTransform: TEXT_TRANSFORM.UPPERCASE,
		letterSpacing: LETTER_SPACING.WIDE,
	},
	copyValue: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S14,
		fontWeight: FONT_WEIGHT.BOLD,
		fontVariant: [FONT_VARIANT.TABULAR_NUMS],
	},
	copyBtn: {
		padding: SPACING.S8,
	},
});

export default VaultScreen;

export {
	CARD_TYPE_LABEL,
	CopyRow,
	getCardSubtitle,
	getIdentitySubtitle,
	getPasswordSubtitle,
	getVaultFormParams,
	getVaultListData,
};
