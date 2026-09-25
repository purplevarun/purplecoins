import * as DocumentPicker from "expo-document-picker";

import appConstants from "@/constants/appConstants";
import AppError from "@/errors/AppError";
import attachmentRepository from "@/repositories/attachmentRepository";
import type AttachmentInput from "@/types/AttachmentInput";
import type AttachmentMetadata from "@/types/AttachmentMetadata";
import type AttachmentOwnerType from "@/types/AttachmentOwnerType";
import createId from "@/utils/id";
import { File, Paths } from "expo-file-system";
import type { SQLiteDatabase } from "expo-sqlite";

const { ATTACHMENT_MAX_BYTES, BACKUP_MIME_TYPE } = appConstants;
const {
	deleteAttachmentRow,
	getAttachmentContentRow,
	getAttachmentMetadataRow,
	upsertAttachmentRow,
} = attachmentRepository;

const pickAttachment = async (): Promise<AttachmentInput | null> => {
	const result = await DocumentPicker.getDocumentAsync({
		copyToCacheDirectory: true,
		multiple: false,
	});
	if (result.canceled) {
		return null;
	}
	const asset = result.assets[0];
	if (!asset) {
		throw new AppError(
			"ATTACHMENT_PICK_FAILED",
			"No attachment was selected.",
		);
	}
	const file = new File(asset.uri);
	const sizeBytes = asset.size ?? file.size;
	if (!sizeBytes || sizeBytes > ATTACHMENT_MAX_BYTES) {
		throw new AppError(
			"ATTACHMENT_TOO_LARGE",
			"Attachments must be 2 MB or smaller.",
		);
	}
	return {
		fileName: asset.name,
		mimeType: asset.mimeType ?? BACKUP_MIME_TYPE,
		sizeBytes,
		content: await file.bytes(),
	};
};

const getAttachmentMetadata = async (
	database: SQLiteDatabase,
	ownerType: AttachmentOwnerType,
	ownerId: string,
): Promise<AttachmentMetadata | null> =>
	getAttachmentMetadataRow(database, ownerType, ownerId);

const saveAttachment = async (
	database: SQLiteDatabase,
	ownerType: AttachmentOwnerType,
	ownerId: string,
	attachment: AttachmentInput,
): Promise<void> => {
	if (attachment.sizeBytes > ATTACHMENT_MAX_BYTES) {
		throw new AppError(
			"ATTACHMENT_TOO_LARGE",
			"Attachments must be 2 MB or smaller.",
		);
	}
	await upsertAttachmentRow(
		database,
		createId(),
		ownerType,
		ownerId,
		attachment,
		Date.now(),
	);
};

const deleteAttachment = async (
	database: SQLiteDatabase,
	ownerType: AttachmentOwnerType,
	ownerId: string,
): Promise<void> => deleteAttachmentRow(database, ownerType, ownerId);

const openAttachment = async (
	database: SQLiteDatabase,
	metadata: AttachmentMetadata,
): Promise<string> => {
	const content = await getAttachmentContentRow(
		database,
		metadata.ownerType,
		metadata.ownerId,
	);
	if (!content) {
		throw new AppError(
			"ATTACHMENT_NOT_FOUND",
			"Attachment content is unavailable.",
		);
	}
	const output = new File(Paths.cache, `${metadata.id}-${metadata.fileName}`);
	output.create({ overwrite: true, intermediates: true });
	output.write(content);

	// Return the cache file URI so callers can preview in-app where supported.
	// For non-previewable flows, callers may still call `Sharing.shareAsync` themselves.
	return output.uri;
};

const attachmentService = {
	deleteAttachment,
	getAttachmentMetadata,
	openAttachment,
	pickAttachment,
	saveAttachment,
};

export default attachmentService;
