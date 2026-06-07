import type { AttachmentOwnerType } from "@/types/AttachmentOwnerType";

type AttachmentMetadata = Readonly<{
	id: string;
	ownerType: AttachmentOwnerType;
	ownerId: string;
	fileName: string;
	mimeType: string;
	sizeBytes: number;
	createdAt: number;
	updatedAt: number;
}>;

export type { AttachmentMetadata };
