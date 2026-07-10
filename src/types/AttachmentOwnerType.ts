import type financeConstants from "@/constants/financeConstants";

type AttachmentOwnerType =
	(typeof financeConstants.ATTACHMENT_OWNER_TYPES)[number];

export type { AttachmentOwnerType as default };
