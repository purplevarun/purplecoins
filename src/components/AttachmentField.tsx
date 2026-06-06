import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import type { AttachmentInput } from "@/types/AttachmentInput";
import type { AttachmentMetadata } from "@/types/AttachmentMetadata";

type AttachmentFieldProps = Readonly<{
	existingAttachment: AttachmentMetadata | null;
	pendingAttachment: AttachmentInput | null;
	isRemoved: boolean;
	onPick: () => void;
	onOpen: () => void;
	onRemove: () => void;
}>;

const formatFileSize = (sizeBytes: number): string =>
	sizeBytes < 1024 * 1024
		? `${Math.ceil(sizeBytes / 1024)} KB`
		: `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

const AttachmentField = ({
	existingAttachment,
	pendingAttachment,
	isRemoved,
	onPick,
	onOpen,
	onRemove,
}: AttachmentFieldProps): React.JSX.Element => {
	const fileName =
		pendingAttachment?.fileName ??
		(!isRemoved ? existingAttachment?.fileName : null);
	const sizeBytes =
		pendingAttachment?.sizeBytes ??
		(!isRemoved ? existingAttachment?.sizeBytes : null);

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Attachment</Text>
			{fileName && sizeBytes ? (
				<View style={styles.fileRow}>
					<View style={styles.fileIcon}>
						<Ionicons
							color={COLORS.primaryBright}
							name="document-attach"
							size={22}
						/>
					</View>
					<View style={styles.fileDetails}>
						<Text numberOfLines={1} style={styles.fileName}>
							{fileName}
						</Text>
						<Text style={styles.fileSize}>
							{formatFileSize(sizeBytes)}
						</Text>
					</View>
					{existingAttachment && !pendingAttachment ? (
						<AppButton
							icon="open-outline"
							isCompact
							label="Open"
							onPress={onOpen}
							variant="secondary"
						/>
					) : null}
					<AppButton
						icon="trash-outline"
						isCompact
						label="Remove"
						onPress={onRemove}
						variant="danger"
					/>
				</View>
			) : (
				<AppButton
					icon="attach"
					label="Choose document"
					onPress={onPick}
					variant="secondary"
				/>
			)}
			<Text style={styles.hint}>One file, maximum 2 MB.</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 8,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	fileRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 9,
		padding: 10,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.035)",
	},
	fileIcon: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primaryMuted,
	},
	fileDetails: {
		flex: 1,
		gap: 2,
	},
	fileName: {
		color: COLORS.text,
		fontSize: 13,
		fontWeight: "700",
	},
	fileSize: {
		color: COLORS.textMuted,
		fontSize: 11,
	},
	hint: {
		color: COLORS.textDim,
		fontSize: 11,
	},
});

export { AttachmentField };
