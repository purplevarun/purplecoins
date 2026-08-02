import type MerchantCategoryRule from "@/types/MerchantCategoryRule";
import type { SQLiteDatabase } from "expo-sqlite";

const getMerchantCategoryRuleRow = async (
	database: SQLiteDatabase,
	merchantKey: string,
): Promise<MerchantCategoryRule | null> =>
	database.getFirstAsync<MerchantCategoryRule>(
		`
			SELECT
				id,
				merchant_key AS merchantKey,
				category_id AS categoryId,
				source_id AS sourceId,
				usage_count AS usageCount,
				last_used_at AS lastUsedAt,
				created_at AS createdAt,
				updated_at AS updatedAt
			FROM merchant_category_rules
			WHERE merchant_key = ?;
		`,
		merchantKey,
	);

const upsertMerchantCategoryRuleRow = async (
	database: SQLiteDatabase,
	rule: MerchantCategoryRule,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO merchant_category_rules (
				id, merchant_key, category_id, source_id,
				usage_count, last_used_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(merchant_key) DO UPDATE SET
				category_id = excluded.category_id,
				source_id = excluded.source_id,
				usage_count = excluded.usage_count,
				last_used_at = excluded.last_used_at,
				updated_at = excluded.updated_at;
		`,
		rule.id,
		rule.merchantKey,
		rule.categoryId,
		rule.sourceId,
		rule.usageCount,
		rule.lastUsedAt,
		rule.createdAt,
		rule.updatedAt,
	);
};

const merchantCategoryRepository = {
	getMerchantCategoryRuleRow,
	upsertMerchantCategoryRuleRow,
};

export default merchantCategoryRepository;
