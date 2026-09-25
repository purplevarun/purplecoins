import type AttachmentInput from "@/types/AttachmentInput";
import type AttachmentMetadata from "@/types/AttachmentMetadata";

type AttachmentFieldProps = Readonly<{
	existingAttachment: AttachmentMetadata | null;
	pendingAttachment: AttachmentInput | null;
	isRemoved: boolean;
	onPick: () => void;
	onOpen: () => void;
	onRemove: () => void;
}>;

export type { AttachmentFieldProps as default };
