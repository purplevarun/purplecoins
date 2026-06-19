type CardType = "CREDIT_CARD" | "DEBIT_CARD";

type CardEntry = Readonly<{
	id: string;
	name: string;
	cardType: CardType;
	cardNumber: string;
	expiry: string;
	cvv: string;
	pin: string;
	network: string;
	notes: string;
	createdAt: number;
	updatedAt: number;
	hasAttachment: boolean;
}>;

export type { CardEntry, CardType };
