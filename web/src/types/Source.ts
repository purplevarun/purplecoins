type Source = Readonly<{
	id: string;
	name: string;
	currencyCode: string;
	validatedAt: number | null;
	createdAt: number;
	updatedAt: number;
	latestTransactionCreatedAt: number | null;
	balance: string;
}>;

export type { Source };
