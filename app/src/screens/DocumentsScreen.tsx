import CustomText from "@/components/CustomText";
import type ListItemProps from "@/types/ListItemProps";

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/AppButton";
import EmptyState from "@/components/EmptyState";
import FloatingAddButton from "@/components/FloatingAddButton";
import GlassCard from "@/components/GlassCard";
import ListHeader from "@/components/ListHeader";
import Notice from "@/components/Notice";
import ScreenList from "@/components/ScreenList";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import attachmentService from "@/services/attachmentService";
import type AttachmentMetadata from "@/types/AttachmentMetadata";
import { formatFileSize, getAttachmentOwnerLabel } from "@/utils/attachment";
import dateUtils from "@/utils/date";
import getErrorMessage from "@/utils/error";
import runAfterRender from "@/utils/runAfterRender";
const {
	deleteAttachment,
	getAttachments,
	openAttachment,
	pickAttachment,
	saveDocument,
} = attachmentService;
const { formatDate } = dateUtils;

const DocumentsScreen = (): React.JSX.Element => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [documents, setDocuments] = useState<readonly AttachmentMetadata[]>(
		[],
	);
	const [error, setError] = useState("");

	const getScreenData = useCallback(async (): Promise<void> => {
		try {
			setDocuments(await getAttachments(database));
			setError("");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database]);

	useEffect(
		() =>
			runAfterRender(() => {
				void getScreenData();
			}),
		[dataVersion, getScreenData],
	);

	const handleAdd = useCallback(async (): Promise<void> => {
		try {
			const attachment = await pickAttachment();
			if (!attachment) {
				return;
			}
			await saveDocument(database, attachment);
			refreshData();
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		}
	}, [database, refreshData]);

	const handleOpen = useCallback(
		async (document: AttachmentMetadata): Promise<void> => {
			try {
				const uri = await openAttachment(database, document);
				const Sharing = await import("expo-sharing");
				if (await Sharing.isAvailableAsync()) {
					await Sharing.shareAsync(uri, {
						dialogTitle: document.fileName,
					});
				}
			} catch (caughtError: unknown) {
				setError(getErrorMessage(caughtError));
			}
		},
		[database],
	);

	const handleDelete = useCallback(
		(document: AttachmentMetadata): void => {
			dialog.confirm({
				title: `Delete "${document.fileName}"?`,
				message: "This removes the file from its linked record.",
				confirmLabel: "Delete",
				variant: "danger",
				onConfirm: () => {
					const processDelete = async (): Promise<void> => {
						try {
							await deleteAttachment(
								database,
								document.ownerType,
								document.ownerId,
							);
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

	const renderDocument = useCallback(
		({ item }: ListItemProps<AttachmentMetadata>): React.JSX.Element => (
			<GlassCard>
				<View style={styles.headingRow}>
					<Ionicons
						color={COLORS.primaryBright}
						name="document-attach-outline"
						size={24}
					/>
					<View style={styles.details}>
						<CustomText style={styles.title}>
							{item.fileName}
						</CustomText>
						<CustomText style={styles.meta}>
							{`${getAttachmentOwnerLabel(item.ownerType)} · ${formatFileSize(item.sizeBytes)}`}
						</CustomText>
						<CustomText style={styles.updatedAt}>
							Updated {formatDate(item.updatedAt)}
						</CustomText>
					</View>
				</View>
				<View style={styles.actions}>
					<AppButton
						icon="open-outline"
						isCompact
						label="Open"
						onPress={() => void handleOpen(item)}
						variant="secondary"
					/>
					<AppButton
						icon="trash-outline"
						isCompact
						label="Delete"
						onPress={() => handleDelete(item)}
						variant="danger"
					/>
				</View>
			</GlassCard>
		),
		[handleDelete, handleOpen],
	);

	const listHeader = error ? (
		<ListHeader>
			<Notice message={error} tone="danger" />
		</ListHeader>
	) : undefined;

	const listEmpty = useMemo(
		() => (
			<EmptyState
				icon="documents-outline"
				message="Attach a file or add one anywhere in the app."
				title="No documents yet"
			/>
		),
		[],
	);

	return (
		<View style={styles.screen}>
			<ScreenList
				ListEmptyComponent={listEmpty}
				ListHeaderComponent={listHeader}
				data={documents}
				keyExtractor={(document) => document.id}
				renderItem={renderDocument}
			/>
			<FloatingAddButton onPress={() => void handleAdd()} />
		</View>
	);
};

const { ALIGN, FLEX, FONT_SIZE, FONT_WEIGHT, SPACING } = styleConstants;

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
});

export default DocumentsScreen;
