import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { deleteCard, getCards } from "@/services/cardService";
import { deleteIdentity, getIdentities } from "@/services/identityService";
import { deletePassword, getPasswords } from "@/services/passwordService";
import type { CardEntry } from "@/types/CardEntry";
import type { IdentityEntry } from "@/types/IdentityEntry";
import type { PasswordEntry } from "@/types/PasswordEntry";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { getErrorMessage } from "@/utils/error";

type VaultScreenProps = NativeStackScreenProps<RootStackParamList, "Vault">;

const VaultScreen = ({
	navigation,
	route,
}: VaultScreenProps): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
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

	useFocusEffect(
		useCallback(() => {
			void dataVersion;
			void getScreenData();
		}, [dataVersion, getScreenData]),
	);

	const handleCopy = async (value: string, label: string): Promise<void> => {
		await Clipboard.setStringAsync(value);
		setMessage(`${label} copied.`);
	};

	const handleDelete = (id: string, label: string): void => {
		Alert.alert(`Delete ${label}?`, "This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					const processDelete = async (): Promise<void> => {
						try {
							if (kind === "PASSWORD") {
								await deletePassword(database, id);
							} else if (kind === "CARD") {
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
			},
		]);
	};

	const normalizedSearch = search.trim().toLowerCase();
	const filteredPasswords = passwords.filter((entry) =>
		`${entry.title} ${entry.username} ${entry.website}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
	const filteredCards = cards.filter((entry) =>
		`${entry.name} ${entry.network} ${entry.cardNumber}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
	const filteredIdentities = identities.filter((entry) =>
		`${entry.title} ${entry.idNumber}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
	const itemCount =
		kind === "PASSWORD"
			? filteredPasswords.length
			: kind === "CARD"
				? filteredCards.length
				: filteredIdentities.length;

	return (
		<View style={styles.screen}>
			<ScreenContainer>
				<Notice
					message="Vault data is stored locally in the Gringotts SQLite database. Phase 1 does not encrypt these fields."
					tone="warning"
				/>
				<TextField
					label="Search"
					onChangeText={setSearch}
					placeholder="Search vault"
					value={search}
				/>
				{message ? <Notice message={message} /> : null}
				{error ? <Notice message={error} tone="danger" /> : null}
				{itemCount === 0 ? (
					<EmptyState
						icon="lock-closed-outline"
						message="Add your first local vault entry."
						title="Nothing here yet"
					/>
				) : null}
				{kind === "PASSWORD"
					? filteredPasswords.map((entry) => (
							<Pressable
								key={entry.id}
								onPress={() =>
									navigation.navigate("VaultForm", {
										kind,
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
											<Text style={styles.title}>
												{entry.title}
											</Text>
											<Text style={styles.meta}>
												{entry.username ||
													entry.website ||
													"No username"}
											</Text>
										</View>
									</View>
									<View style={styles.actions}>
										<AppButton
											icon="copy-outline"
											isCompact
											label="Copy"
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
												)
											}
											variant="danger"
										/>
									</View>
								</GlassCard>
							</Pressable>
						))
					: null}
				{kind === "CARD"
					? filteredCards.map((entry) => (
							<Pressable
								key={entry.id}
								onPress={() =>
									navigation.navigate("VaultForm", {
										kind,
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
											<Text style={styles.title}>
												{entry.name}
											</Text>
											<Text style={styles.meta}>
												{entry.network || "Card"} · ••••{" "}
												{entry.cardNumber.slice(-4)}
											</Text>
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
											icon="copy-outline"
											isCompact
											label="Copy number"
											onPress={() =>
												void handleCopy(
													entry.cardNumber,
													"Card number",
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
													entry.name,
												)
											}
											variant="danger"
										/>
									</View>
								</GlassCard>
							</Pressable>
						))
					: null}
				{kind === "IDENTITY"
					? filteredIdentities.map((entry) => (
							<Pressable
								key={entry.id}
								onPress={() =>
									navigation.navigate("VaultForm", {
										kind,
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
											<Text style={styles.title}>
												{entry.title}
											</Text>
											<Text style={styles.meta}>
												{entry.idNumber ||
													"No ID number"}
											</Text>
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
												)
											}
											variant="danger"
										/>
									</View>
								</GlassCard>
							</Pressable>
						))
					: null}
			</ScreenContainer>
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
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
		marginTop: 13,
	},
});

export { VaultScreen };
