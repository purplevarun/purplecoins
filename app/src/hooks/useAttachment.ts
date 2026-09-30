import attachmentService from "@/services/attachmentService";

import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";

import useDatabaseContext from "@/hooks/useDatabaseContext";
import type AttachmentInput from "@/types/AttachmentInput";
import type AttachmentMetadata from "@/types/AttachmentMetadata";
import type AttachmentOwnerType from "@/types/AttachmentOwnerType";
import type UseAttachmentResult from "@/types/UseAttachmentResult";
const {
	deleteAttachment,
	getAttachmentMetadata,
	openAttachment,
	pickAttachment,
	saveAttachment,
} = attachmentService;

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

	const handleOpen = async (): Promise<string | null> => {
		if (existingAttachment) {
			return await openAttachment(database, existingAttachment);
		}
		return null;
	};

	const handleSend = async (): Promise<void> => {
		const uri = await handleOpen();
		if (!uri || !(await Sharing.isAvailableAsync())) {
			return;
		}
		await Sharing.shareAsync(uri, {
			dialogTitle: existingAttachment?.fileName,
		});
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
		handleSend,
		handleRemove,
		processAttachment,
	};
};

export default useAttachment;
