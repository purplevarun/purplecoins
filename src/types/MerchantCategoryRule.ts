type MerchantCategoryRule = Readonly<{
	id: string;
	merchantKey: string;
	categoryId: string | null;
	sourceId: string | null;
	usageCount: number;
	lastUsedAt: number;
	createdAt: number;
	updatedAt: number;
}>;

export type { MerchantCategoryRule as default };
