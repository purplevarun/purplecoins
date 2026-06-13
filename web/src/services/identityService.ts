import type { WebDatabase } from "@/db/database";

import {
	deleteContentRow,
	getIdentityRow,
	getIdentityRows,
	upsertIdentityRow,
} from "@/repositories/contentRepository";
import type { IdentityEntry } from "@/types/IdentityEntry";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";

const mapIdentity = (identity: IdentityEntry): IdentityEntry => ({
	...identity,
	hasAttachment: Boolean(identity.hasAttachment),
});

const getIdentities = async (
	database: WebDatabase,
): Promise<readonly IdentityEntry[]> => {
	const identities = await getIdentityRows(database);
	return identities.map(mapIdentity);
};

const getIdentity = async (
	database: WebDatabase,
	id: string,
): Promise<IdentityEntry | null> => {
	const identity = await getIdentityRow(database, id);
	return identity ? mapIdentity(identity) : null;
};

const saveIdentity = async (
	database: WebDatabase,
	entry: Readonly<{
		id?: string;
		title: string;
		idNumber: string;
		notes: string;
	}>,
): Promise<string> => {
	const title = entry.title.trim();
	if (!title) {
		throw new AppError(
			"IDENTITY_TITLE_REQUIRED",
			"Identity title is required.",
		);
	}
	const now = Date.now();
	const existing = entry.id ? await getIdentityRow(database, entry.id) : null;
	const id = entry.id ?? createId();
	await upsertIdentityRow(database, {
		id,
		title,
		idNumber: entry.idNumber.trim(),
		notes: entry.notes.trim(),
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
		hasAttachment: existing?.hasAttachment ?? false,
	});
	return id;
};

const deleteIdentity = async (
	database: WebDatabase,
	id: string,
): Promise<void> => deleteContentRow(database, "identities", "IDENTITY", id);

export { deleteIdentity, getIdentities, getIdentity, saveIdentity };
