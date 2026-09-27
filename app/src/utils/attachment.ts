import type AttachmentOwnerType from "@/types/AttachmentOwnerType";

const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = 1024 * 1024;

const formatFileSize = (sizeBytes: number): string =>
	sizeBytes < BYTES_PER_MEGABYTE
		? `${Math.ceil(sizeBytes / BYTES_PER_KILOBYTE)} KB`
		: `${(sizeBytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;

const getAttachmentOwnerLabel = (ownerType: AttachmentOwnerType): string =>
	ownerType.charAt(0) + ownerType.slice(1).toLowerCase();

export { formatFileSize, getAttachmentOwnerLabel };
