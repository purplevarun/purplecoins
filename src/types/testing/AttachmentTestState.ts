import type AttachmentInput from "@/types/AttachmentInput";

type AttachmentTestState = {
	pendingAttachment: AttachmentInput | null;
	isRemoved: boolean;
};

export type { AttachmentTestState as default };
