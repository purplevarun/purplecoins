import { useEffect, useState } from "react";

import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	deleteAttachment,
	getAttachmentMetadata,
	openAttachment,
	pickAttachment,
	saveAttachment,
} from "@/services/attachmentService";
import type { AttachmentInput } from "@/types/AttachmentInput";
import type { AttachmentMetadata } from "@/types/AttachmentMetadata";
import type { AttachmentOwnerType } from "@/types/AttachmentOwnerType";

type UseAttachmentResult = Readonly<{
	existingAttachment: AttachmentMetadata | null;
	pendingAttachment: AttachmentInput | null;
	isRemoved: boolean;
	handlePick: () => Promise<void>;
	handleOpen: () => Promise<void>;
	handleRemove: () => void;
	processAttachment: (ownerId: string) => Promise<void>;
}>;

const useAttachment = (
	ownerType: AttachmentOwnerType,
	ownerId?: string,
): UseAttachmentResult => {
	const { database } = useDatabaseContext();
	const [existingAttachment, setExistingAttachment] =
		useState<AttachmentMetadata | null>(null);
	const [pendingAttachment, setPendingAttachment] =
		useState<AttachmentInput | null>(null);
	const [isRemoved, setIsRemoved] = useState(false);

	useEffect(() => {
		const getExistingAttachment = async (): Promise<void> => {
			if (!ownerId) {
				setExistingAttachment(null);
				return;
			}
			setExistingAttachment(
				await getAttachmentMetadata(database, ownerType, ownerId),
			);
		};
		void getExistingAttachment();
	}, [database, ownerId, ownerType]);

	const handlePick = async (): Promise<void> => {
		const attachment = await pickAttachment();
		if (!attachment) {
			return;
		}
		setPendingAttachment(attachment);
		setIsRemoved(false);
	};

	const handleOpen = async (): Promise<void> => {
		if (existingAttachment) {
			await openAttachment(database, existingAttachment);
		}
	};

	const handleRemove = (): void => {
		setPendingAttachment(null);
		setIsRemoved(true);
	};

	const processAttachment = async (recordId: string): Promise<void> => {
		if (pendingAttachment) {
			await saveAttachment(
				database,
				ownerType,
				recordId,
				pendingAttachment,
			);
			return;
		}
		if (isRemoved && existingAttachment) {
			await deleteAttachment(database, ownerType, recordId);
		}
	};

	return {
		existingAttachment,
		pendingAttachment,
		isRemoved,
		handlePick,
		handleOpen,
		handleRemove,
		processAttachment,
	};
};

export { useAttachment };
