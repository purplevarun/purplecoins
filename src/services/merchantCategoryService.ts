import merchantCategoryRepository from "@/repositories/merchantCategoryRepository";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const { getMerchantCategoryRuleRow, upsertMerchantCategoryRuleRow } =
	merchantCategoryRepository;

type MerchantSuggestion = Readonly<{
	categoryId: string | null;
	sourceId: string | null;
}>;

const normalizeMerchantKey = (merchant: string): string =>
	merchant.trim().toLowerCase().replace(/\s+/g, " ");

const getSuggestionForMerchant = async (
	database: SQLiteDatabase,
	merchant: string,
): Promise<MerchantSuggestion | null> => {
	const merchantKey = normalizeMerchantKey(merchant);
	if (!merchantKey) {
		return null;
	}
	const rule = await getMerchantCategoryRuleRow(database, merchantKey);
	if (!rule) {
		return null;
	}
	return { categoryId: rule.categoryId, sourceId: rule.sourceId };
};

const recordMerchantChoice = async (
	database: SQLiteDatabase,
	merchant: string,
	categoryId: string | null,
	sourceId: string | null,
): Promise<void> => {
	const merchantKey = normalizeMerchantKey(merchant);
	if (!merchantKey) {
		return;
	}
	const now = Date.now();
	const existingRule = await getMerchantCategoryRuleRow(
		database,
		merchantKey,
	);
	await upsertMerchantCategoryRuleRow(database, {
		id: existingRule?.id ?? createId(),
		merchantKey,
		categoryId,
		sourceId,
		usageCount: (existingRule?.usageCount ?? 0) + 1,
		lastUsedAt: now,
		createdAt: existingRule?.createdAt ?? now,
		updatedAt: now,
	});
};

const merchantCategoryService = {
	getSuggestionForMerchant,
	recordMerchantChoice,
};

export type { MerchantSuggestion };
export default merchantCategoryService;
