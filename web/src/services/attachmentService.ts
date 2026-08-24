// Attachments not supported in web version
import type { WebDatabase } from "@/db/database";

export const getAttachment = async (
	_db: WebDatabase,
	_ownerId: string,
): Promise<null> => null;
export const saveAttachment = async (): Promise<void> => {};
export const deleteAttachment = async (): Promise<void> => {};
