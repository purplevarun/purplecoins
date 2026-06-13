import type { WebDatabase } from "@/db/database";

import {
	deleteContentRow,
	getCardRow,
	getCardRows,
	upsertCardRow,
} from "@/repositories/contentRepository";
import type { CardEntry } from "@/types/CardEntry";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";

const mapCard = (card: CardEntry): CardEntry => ({
	...card,
	hasAttachment: Boolean(card.hasAttachment),
});

const getCards = async (
	database: WebDatabase,
): Promise<readonly CardEntry[]> => {
	const cards = await getCardRows(database);
	return cards.map(mapCard);
};

const getCard = async (
	database: WebDatabase,
	id: string,
): Promise<CardEntry | null> => {
	const card = await getCardRow(database, id);
	return card ? mapCard(card) : null;
};

const saveCard = async (
	database: WebDatabase,
	entry: Readonly<{
		id?: string;
		name: string;
		cardNumber: string;
		expiry: string;
		cvv: string;
		pin: string;
		network: string;
		notes: string;
	}>,
): Promise<string> => {
	const name = entry.name.trim();
	if (!name || !entry.cardNumber.trim()) {
		throw new AppError(
			"CARD_FIELDS_REQUIRED",
			"Card name and number are required.",
		);
	}
	const now = Date.now();
	const existing = entry.id ? await getCardRow(database, entry.id) : null;
	const id = entry.id ?? createId();
	await upsertCardRow(database, {
		id,
		name,
		cardNumber: entry.cardNumber.trim(),
		expiry: entry.expiry.trim(),
		cvv: entry.cvv.trim(),
		pin: entry.pin.trim(),
		network: entry.network.trim(),
		notes: entry.notes.trim(),
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
		hasAttachment: existing?.hasAttachment ?? false,
	});
	return id;
};

const deleteCard = async (database: WebDatabase, id: string): Promise<void> =>
	deleteContentRow(database, "cards", "CARD", id);

export { deleteCard, getCard, getCards, saveCard };
