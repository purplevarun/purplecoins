type TransactionItem = Readonly<{
	id: string;
	transactionId: string;
	categoryId: string;
	categoryName: string;
	amount: string;
	position: number;
	createdAt: number;
	updatedAt: number;
}>;

export type { TransactionItem as default };
