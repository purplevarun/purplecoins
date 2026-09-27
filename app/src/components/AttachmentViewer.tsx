import CustomText from "@/components/CustomText";
import HeaderIconButton from "@/components/HeaderIconButton";
import { Image, Modal, StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type AttachmentViewerProps from "@/types/AttachmentViewerProps";
import { getAttachmentPreviewKind } from "@/utils/attachment";

const AttachmentViewer = ({
	uri,
	fileName,
	mimeType,
	onClose,
}: AttachmentViewerProps): React.JSX.Element => {
	const previewKind = getAttachmentPreviewKind(mimeType);

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			visible={uri !== null}
		>
			<View style={styles.overlay}>
				<View style={styles.body}>
					{previewKind === "IMAGE" && uri !== null ? (
						<Image
							resizeMode="contain"
							source={{ uri }}
							style={styles.preview}
						/>
					) : previewKind === "PDF" && uri !== null ? (
						<Pdf
							source={{ uri }}
							style={styles.preview}
							trustAllCerts={false}
						/>
					) : uri !== null ? (
						<View style={styles.fallback}>
							<CustomText style={styles.fallbackText}>
								Preview is not available for this file type.
							</CustomText>
						</View>
					) : null}
				</View>
				<View style={styles.header}>
					<CustomText numberOfLines={1} style={styles.title}>
						{fileName}
					</CustomText>
					<HeaderIconButton
						accessibilityLabel="Close preview"
						icon="close"
						onPress={onClose}
					/>
				</View>
			</View>
		</Modal>
	);
};

const { ALIGN, FLEX, FONT_SIZE, FONT_WEIGHT, POSITION, SPACING } =
	styleConstants;

const styles = StyleSheet.create({
	overlay: {
		flex: FLEX.FILL,
		backgroundColor: COLORS.background,
	},
	header: {
		position: POSITION.ABSOLUTE,
		top: SPACING.S48,
		left: SPACING.S16,
		right: SPACING.S16,
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S10,
	},
	title: {
		flex: FLEX.FILL,
		color: COLORS.text,
		fontSize: FONT_SIZE.S16,
		fontWeight: FONT_WEIGHT.HEAVY,
	},
	body: {
		flex: FLEX.FILL,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
	},
	preview: {
		flex: FLEX.FILL,
	},
	fallback: {
		padding: SPACING.S24,
	},
	fallbackText: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S14,
		textAlign: ALIGN.CENTER,
	},
});

export default AttachmentViewer;
