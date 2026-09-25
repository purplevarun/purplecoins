import type { SQLiteDatabase } from "expo-sqlite";

import type AttachmentInput from "@/types/AttachmentInput";
import type AttachmentMetadata from "@/types/AttachmentMetadata";
import type AttachmentOwnerType from "@/types/AttachmentOwnerType";

const getAttachmentMetadataRow = async (
	database: SQLiteDatabase,
	ownerType: AttachmentOwnerType,
	ownerId: string,
): Promise<AttachmentMetadata | null> =>
	database.getFirstAsync<AttachmentMetadata>(
		`
			SELECT
				id,
				owner_type AS ownerType,
				owner_id AS ownerId,
				file_name AS fileName,
				mime_type AS mimeType,
				size_bytes AS sizeBytes,
				created_at AS createdAt,
				updated_at AS updatedAt
			FROM attachments
			WHERE owner_type = ? AND owner_id = ?;
		`,
		ownerType,
		ownerId,
	);

const getAttachmentContentRow = async (
	database: SQLiteDatabase,
	ownerType: AttachmentOwnerType,
	ownerId: string,
): Promise<Uint8Array | null> => {
	const row = await database.getFirstAsync<Pick<AttachmentInput, "content">>(
		`
			SELECT content
			FROM attachments
			WHERE owner_type = ? AND owner_id = ?;
		`,
		ownerType,
		ownerId,
	);
	return row?.content ?? null;
};

const upsertAttachmentRow = async (
	database: SQLiteDatabase,
	id: string,
	ownerType: AttachmentOwnerType,
	ownerId: string,
	attachment: AttachmentInput,
	now: number,
): Promise<void> => {
	const updateResult = await database.runAsync(
		`
			UPDATE attachments
			SET file_name = ?, mime_type = ?, size_bytes = ?, content = ?, updated_at = ?
			WHERE owner_type = ? AND owner_id = ?;
		`,
		attachment.fileName,
		attachment.mimeType,
		attachment.sizeBytes,
		attachment.content,
		now,
		ownerType,
		ownerId,
	);
	if ((updateResult as { changes?: number } | undefined)?.changes) return;
	await database.runAsync(
		`
			INSERT INTO attachments (
				id, owner_type, owner_id, file_name, mime_type,
				size_bytes, content, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
		`,
		id,
		ownerType,
		ownerId,
		attachment.fileName,
		attachment.mimeType,
		attachment.sizeBytes,
		attachment.content,
		now,
		now,
	);
};

const deleteAttachmentRow = async (
	database: SQLiteDatabase,
	ownerType: AttachmentOwnerType,
	ownerId: string,
): Promise<void> => {
	await database.runAsync(
		"DELETE FROM attachments WHERE owner_type = ? AND owner_id = ?;",
		ownerType,
		ownerId,
	);
};

const attachmentRepository = {
	deleteAttachmentRow,
	getAttachmentContentRow,
	getAttachmentMetadataRow,
	upsertAttachmentRow,
};

export default attachmentRepository;
