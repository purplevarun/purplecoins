import AppError from "@/errors/AppError";
import contentRepository from "@/repositories/contentRepository";
import type CardEntry from "@/types/CardEntry";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteContentRow, getCardRow, getCardRows, upsertCardRow } =
	contentRepository;

const mapCard = (card: CardEntry): CardEntry => ({
	...card,
	hasAttachment: Boolean(card.hasAttachment),
});

const getCards = async (
	database: SQLiteDatabase,
): Promise<readonly CardEntry[]> => {
	const cards = await getCardRows(database);
	return cards.map(mapCard);
};

const getCard = async (
	database: SQLiteDatabase,
	id: string,
): Promise<CardEntry | null> => {
	const card = await getCardRow(database, id);
	return card ? mapCard(card) : null;
};

const saveCard = async (
	database: SQLiteDatabase,
	entry: Readonly<{
		id?: string;
		name: string;
		cardType: "CREDIT_CARD" | "DEBIT_CARD";
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
		cardType: entry.cardType,
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

const deleteCard = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => deleteContentRow(database, "cards", "CARD", id);

const cardService = {
	deleteCard,
	getCard,
	getCards,
	saveCard,
};

export default cardService;
