import type AttachmentInput from "@/types/AttachmentInput";
import type AttachmentMetadata from "@/types/AttachmentMetadata";

type UseAttachmentResult = Readonly<{
	existingAttachment: AttachmentMetadata | null;
	pendingAttachment: AttachmentInput | null;
	isRemoved: boolean;
	handlePick: () => Promise<void>;
	handleOpen: () => Promise<void>;
	handleRemove: () => void;
	processAttachment: (ownerId: string) => Promise<void>;
}>;

export type { UseAttachmentResult as default };
