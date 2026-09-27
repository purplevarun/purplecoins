import type AttachmentOwnerType from "@/types/AttachmentOwnerType";
import type AttachmentPreviewKind from "@/types/AttachmentPreviewKind";

const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = 1024 * 1024;
const PDF_MIME_TYPE = "application/pdf";

const formatFileSize = (sizeBytes: number): string =>
	sizeBytes < BYTES_PER_MEGABYTE
		? `${Math.ceil(sizeBytes / BYTES_PER_KILOBYTE)} KB`
		: `${(sizeBytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;

const getAttachmentOwnerLabel = (ownerType: AttachmentOwnerType): string =>
	ownerType.charAt(0) + ownerType.slice(1).toLowerCase();

const getAttachmentPreviewKind = (mimeType?: string): AttachmentPreviewKind => {
	if (mimeType?.startsWith("image/")) {
		return "IMAGE";
	}
	if (mimeType === PDF_MIME_TYPE) {
		return "PDF";
	}
	return "UNSUPPORTED";
};

export { formatFileSize, getAttachmentOwnerLabel, getAttachmentPreviewKind };
