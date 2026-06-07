import { CustomText } from "@/components/CustomText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AttachmentField } from "@/components/AttachmentField";
import { GlassCard } from "@/components/GlassCard";
import { Notice } from "@/components/Notice";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { useAttachment } from "@/hooks/useAttachment";
import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import { deleteCard, getCard, saveCard } from "@/services/cardService";
import {
	deleteIdentity,
	getIdentity,
	saveIdentity,
} from "@/services/identityService";
import {
	deletePassword,
	getPassword,
	savePassword,
} from "@/services/passwordService";
import type { RootStackParamList } from "@/types/RootStackParamList";
import { getErrorMessage } from "@/utils/error";

type VaultFormScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"VaultForm"
>;

const VaultFormScreen = ({
	navigation,
	route,
}: VaultFormScreenProps): React.JSX.Element => {
	const { kind, entryId } = route.params;
	const { database, refreshData } = useDatabaseContext();
	const attachmentOwnerType = kind === "CARD" ? "CARD" : "IDENTITY";
	const attachment = useAttachment(attachmentOwnerType, entryId);
	const [title, setTitle] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [website, setWebsite] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [pin, setPin] = useState("");
	const [network, setNetwork] = useState("");
	const [idNumber, setIdNumber] = useState("");
	const [notes, setNotes] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const getEntry = async (): Promise<void> => {
			if (!entryId) {
				return;
			}
			try {
				if (kind === "PASSWORD") {
					const entry = await getPassword(database, entryId);
					if (entry) {
						setTitle(entry.title);
						setUsername(entry.username);
						setPassword(entry.password);
						setWebsite(entry.website);
						setNotes(entry.notes);
					}
					return;
				}
				if (kind === "CARD") {
					const entry = await getCard(database, entryId);
					if (entry) {
						setTitle(entry.name);
						setCardNumber(entry.cardNumber);
						setExpiry(entry.expiry);
						setCvv(entry.cvv);
						setPin(entry.pin);
						setNetwork(entry.network);
						setNotes(entry.notes);
					}
					return;
				}
				const entry = await getIdentity(database, entryId);
				if (entry) {
					setTitle(entry.title);
					setIdNumber(entry.idNumber);
					setNotes(entry.notes);
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		};
		void getEntry();
	}, [database, entryId, kind]);

	const handleSave = async (): Promise<void> => {
		setIsSaving(true);
		setError("");
		try {
			let savedId = "";
			if (kind === "PASSWORD") {
				savedId = await savePassword(database, {
					id: entryId,
					title,
					username,
					password,
					website,
					notes,
				});
			} else if (kind === "CARD") {
				savedId = await saveCard(database, {
					id: entryId,
					name: title,
					cardNumber,
					expiry,
					cvv,
					pin,
					network,
					notes,
				});
				await attachment.processAttachment(savedId);
			} else {
				savedId = await saveIdentity(database, {
					id: entryId,
					title,
					idNumber,
					notes,
				});
				await attachment.processAttachment(savedId);
			}
			refreshData();
			navigation.goBack();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = (): void => {
		if (!entryId) {
			return;
		}
		Alert.alert("Delete vault entry?", "This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					const processDelete = async (): Promise<void> => {
						if (kind === "PASSWORD") {
							await deletePassword(database, entryId);
						} else if (kind === "CARD") {
							await deleteCard(database, entryId);
						} else {
							await deleteIdentity(database, entryId);
						}
						refreshData();
						navigation.goBack();
					};
					void processDelete();
				},
			},
		]);
	};

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.form}>
					<CustomText style={styles.heading}>
						{entryId ? "Edit" : "New"} {kind.toLowerCase()}
					</CustomText>
					<TextField
						label={kind === "CARD" ? "Card name" : "Title"}
						onChangeText={setTitle}
						placeholder={
							kind === "CARD" ? "Personal Visa" : "Entry title"
						}
						value={title}
					/>
					{kind === "PASSWORD" ? (
						<>
							<TextField
								autoCapitalize="none"
								label="Username"
								onChangeText={setUsername}
								placeholder="Username or email"
								value={username}
							/>
							<TextField
								autoCapitalize="none"
								isSecure
								label="Password"
								onChangeText={setPassword}
								placeholder="Password"
								value={password}
							/>
							<TextField
								autoCapitalize="none"
								keyboardType="url"
								label="Website"
								onChangeText={setWebsite}
								placeholder="https://"
								value={website}
							/>
						</>
					) : null}
					{kind === "CARD" ? (
						<>
							<TextField
								keyboardType="number-pad"
								label="Card number"
								onChangeText={setCardNumber}
								placeholder="Card number"
								value={cardNumber}
							/>
							<TextField
								label="Network"
								onChangeText={setNetwork}
								placeholder="Visa, Mastercard, RuPay..."
								value={network}
							/>
							<TextField
								label="Expiry"
								onChangeText={setExpiry}
								placeholder="MM/YY"
								value={expiry}
							/>
							<TextField
								isSecure
								keyboardType="number-pad"
								label="CVV"
								onChangeText={setCvv}
								placeholder="CVV"
								value={cvv}
							/>
							<TextField
								isSecure
								keyboardType="number-pad"
								label="PIN"
								onChangeText={setPin}
								placeholder="PIN"
								value={pin}
							/>
						</>
					) : null}
					{kind === "IDENTITY" ? (
						<TextField
							label="ID number"
							onChangeText={setIdNumber}
							placeholder="Document number"
							value={idNumber}
						/>
					) : null}
					<TextField
						isMultiline
						label="Notes"
						onChangeText={setNotes}
						placeholder="Optional notes"
						value={notes}
					/>
					{kind !== "PASSWORD" ? (
						<AttachmentField
							existingAttachment={attachment.existingAttachment}
							isRemoved={attachment.isRemoved}
							onOpen={() => void attachment.handleOpen()}
							onPick={() => void attachment.handlePick()}
							onRemove={attachment.handleRemove}
							pendingAttachment={attachment.pendingAttachment}
						/>
					) : null}
					{error ? <Notice message={error} tone="danger" /> : null}
					<AppButton
						isLoading={isSaving}
						label="Save entry"
						onPress={() => void handleSave()}
					/>
					{entryId ? (
						<AppButton
							label="Delete entry"
							onPress={handleDelete}
							variant="danger"
						/>
					) : null}
				</View>
			</GlassCard>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	form: {
		gap: 16,
	},
	heading: {
		color: COLORS.text,
		fontSize: 24,
		fontWeight: "900",
		textTransform: "capitalize",
	},
});

export { VaultFormScreen };
