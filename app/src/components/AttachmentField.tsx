import CustomText from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import AttachmentViewer from "@/components/AttachmentViewer";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type AttachmentFieldProps from "@/types/AttachmentFieldProps";
import { formatFileSize } from "@/utils/attachment";

const AttachmentField = ({
	existingAttachment,
	pendingAttachment,
	isRemoved,
	onPick,
	onView,
	onSend,
	onRemove,
}: AttachmentFieldProps): React.JSX.Element => {
	const [viewUri, setViewUri] = useState<string | null>(null);
	const fileName =
		pendingAttachment?.fileName ??
		(!isRemoved ? existingAttachment?.fileName : null);
	const sizeBytes =
		pendingAttachment?.sizeBytes ??
		(!isRemoved ? existingAttachment?.sizeBytes : null);
	const mimeType = existingAttachment?.mimeType;

	const handleView = async (): Promise<void> => {
		const uri = await onView();
		if (uri) {
			setViewUri(uri);
		}
	};

	return (
		<View style={styles.container}>
			<CustomText style={styles.label}>Attachment</CustomText>
			{fileName && sizeBytes ? (
				<>
					<View style={styles.fileRow}>
						<View style={styles.fileIcon}>
							<Ionicons
								color={COLORS.primaryBright}
								name="document-attach"
								size={22}
							/>
						</View>
						<View style={styles.fileDetails}>
							<CustomText
								numberOfLines={1}
								style={styles.fileName}
							>
								{fileName}
							</CustomText>
							<CustomText style={styles.fileSize}>
								{formatFileSize(sizeBytes)}
							</CustomText>
						</View>
					</View>
					<View style={styles.fileActions}>
						{existingAttachment && !pendingAttachment ? (
							<>
								<AppButton
									icon="eye-outline"
									isCompact
									label="View"
									onPress={() => void handleView()}
									variant="secondary"
								/>
								<AppButton
									icon="share-outline"
									isCompact
									label="Send"
									onPress={onSend}
									variant="secondary"
								/>
							</>
						) : null}
						<AppButton
							icon="trash-outline"
							isCompact
							label="Delete"
							onPress={onRemove}
							variant="danger"
						/>
					</View>
					<AttachmentViewer
						fileName={fileName}
						mimeType={mimeType}
						onClose={() => setViewUri(null)}
						uri={viewUri}
					/>
				</>
			) : (
				<AppButton
					icon="attach"
					label="Choose document"
					onPress={onPick}
					variant="secondary"
				/>
			)}
			<CustomText style={styles.hint}>One file, maximum 2 MB.</CustomText>
		</View>
	);
};

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	RADIUS,
	SIZES,
	SPACING,
	TEXT_TRANSFORM,
} = styleConstants;

const styles = StyleSheet.create({
	container: {
		gap: SPACING.S8,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		fontWeight: FONT_WEIGHT.BOLD,
		textTransform: TEXT_TRANSFORM.UPPERCASE,
		letterSpacing: LETTER_SPACING.WIDEST,
	},
	fileRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S9,
		padding: SPACING.S10,
		borderRadius: RADIUS.S15,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surfaceSoft,
	},
	fileIcon: {
		width: SIZES.S38,
		height: SIZES.S38,
		borderRadius: RADIUS.S12,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		backgroundColor: COLORS.primaryMuted,
	},
	fileDetails: {
		flex: FLEX.FILL,
		gap: SPACING.S2,
	},
	fileName: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S13,
		fontWeight: FONT_WEIGHT.BOLD,
	},
	fileSize: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S11,
	},
	fileActions: {
		flexDirection: FLEX.ROW,
		gap: SPACING.S8,
	},
	hint: {
		color: COLORS.textDim,
		fontSize: FONT_SIZE.S11,
	},
});

export default AttachmentField;
