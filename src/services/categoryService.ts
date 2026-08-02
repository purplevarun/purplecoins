import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import type Budget from "@/types/Budget";
import type Category from "@/types/Category";
import type CategoryType from "@/types/CategoryType";
import createId from "@/utils/id";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	categoryNameExistsRow,
	deleteBudgetRow,
	deleteCategoryRow,
	getBudgetRows,
	getArchivedCategoryRows,
	getCategoryRow,
	getCategoryRows,
	getTransactionRows,
	setCategoryArchivedRow,
	upsertBudgetRow,
	upsertCategoryRow,
} = financeRepository;
const { addMoney } = moneyUtils;

const CATEGORY_TYPES: readonly CategoryType[] = ["INCOME", "EXPENSE", "REFUND"];

const mapCategory = (category: Category): Category => ({
	...category,
	archived: Boolean(category.archived),
});

const getCategories = async (
	database: SQLiteDatabase,
): Promise<readonly Category[]> => {
	const categories = await getCategoryRows(database);
	return categories.map(mapCategory);
};

const getCategory = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Category | null> => {
	const category = await getCategoryRow(database, id);
	return category ? mapCategory(category) : null;
};

const getArchivedCategories = async (
	database: SQLiteDatabase,
): Promise<readonly Category[]> => {
	const categories = await getArchivedCategoryRows(database);
	return categories.map(mapCategory);
};

const saveCategory = async (
	database: SQLiteDatabase,
	id: string | undefined,
	name: string,
	type: CategoryType,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"CATEGORY_NAME_REQUIRED",
			"Category name is required.",
		);
	}
	if (!CATEGORY_TYPES.includes(type)) {
		throw new AppError(
			"CATEGORY_TYPE_INVALID",
			"Category type must be Income, Expense, or Refund.",
		);
	}
	if (await categoryNameExistsRow(database, normalizedName, id)) {
		throw new AppError(
			"CATEGORY_NAME_DUPLICATE",
			`A category named "${normalizedName}" already exists.`,
		);
	}
	const now = Date.now();
	const existingCategory = id ? await getCategoryRow(database, id) : null;
	const categoryId = id ?? createId();
	await upsertCategoryRow(database, {
		id: categoryId,
		name: normalizedName,
		type,
		createdAt: existingCategory?.createdAt ?? now,
		updatedAt: now,
		archived: existingCategory?.archived ?? false,
	});
	return categoryId;
};

const buildMergedBudgets = (
	budgets: readonly Budget[],
	mergedCategoryId: string,
	mergedCategoryName: string,
	now: number,
): readonly Budget[] => {
	const budgetsByPeriod = new Map<Budget["period"], Budget>();

	budgets.forEach((budget) => {
		const existingBudget = budgetsByPeriod.get(budget.period);
		if (!existingBudget) {
			budgetsByPeriod.set(budget.period, {
				...budget,
				id: createId(),
				categoryId: mergedCategoryId,
				categoryName: mergedCategoryName,
				updatedAt: now,
			});
			return;
		}

		budgetsByPeriod.set(budget.period, {
			...existingBudget,
			amount: addMoney(existingBudget.amount, budget.amount),
			createdAt: Math.min(existingBudget.createdAt, budget.createdAt),
			updatedAt: now,
		});
	});

	return [...budgetsByPeriod.values()];
};

const mergeCategories = async (
	database: SQLiteDatabase,
	firstCategoryId: string,
	secondCategoryId: string,
	newCategoryName: string,
): Promise<string> => {
	if (
		!firstCategoryId ||
		!secondCategoryId ||
		firstCategoryId === secondCategoryId
	) {
		throw new AppError(
			"CATEGORY_MERGE_SELECTION_INVALID",
			"Select two different categories to merge.",
		);
	}

	const normalizedName = newCategoryName.trim();
	if (!normalizedName) {
		throw new AppError(
			"CATEGORY_NAME_REQUIRED",
			"Category name is required.",
		);
	}

	const [firstCategoryRow, secondCategoryRow, activeCategories, budgets] =
		await Promise.all([
			getCategoryRow(database, firstCategoryId),
			getCategoryRow(database, secondCategoryId),
			getCategoryRows(database),
			getBudgetRows(database),
		]);

	if (!firstCategoryRow || !secondCategoryRow) {
		throw new AppError(
			"CATEGORY_NOT_FOUND",
			"One of the selected categories no longer exists.",
		);
	}

	const firstCategory = mapCategory(firstCategoryRow);
	const secondCategory = mapCategory(secondCategoryRow);
	if (firstCategory.type !== secondCategory.type) {
		throw new AppError(
			"CATEGORY_MERGE_TYPE_MISMATCH",
			"Both categories must be the same type (Income, Expense, or Refund).",
		);
	}

	const normalizedNameLower = normalizedName.toLowerCase();
	const hasNameCollision = activeCategories.some(
		(category) =>
			category.id !== firstCategoryId &&
			category.id !== secondCategoryId &&
			category.name.trim().toLowerCase() === normalizedNameLower,
	);
	if (hasNameCollision) {
		throw new AppError(
			"CATEGORY_NAME_DUPLICATE",
			`A category named "${normalizedName}" already exists.`,
		);
	}

	const now = Date.now();
	const mergedCategoryId = createId();
	const sourceCategoryIds = new Set([firstCategoryId, secondCategoryId]);
	const sourceBudgets = budgets.filter((budget) =>
		sourceCategoryIds.has(budget.categoryId),
	);
	const mergedBudgets = buildMergedBudgets(
		sourceBudgets,
		mergedCategoryId,
		normalizedName,
		now,
	);

	await database.withTransactionAsync(async (): Promise<void> => {
		await upsertCategoryRow(database, {
			id: mergedCategoryId,
			name: normalizedName,
			type: firstCategory.type,
			createdAt: now,
			updatedAt: now,
			archived: false,
		});

		await database.runAsync(
			`
				UPDATE transactions
				SET category_id = ?, updated_at = ?
				WHERE category_id IN (?, ?);
			`,
			mergedCategoryId,
			now,
			firstCategoryId,
			secondCategoryId,
		);

		for (const budget of sourceBudgets) {
			await deleteBudgetRow(database, budget.id);
		}

		for (const budget of mergedBudgets) {
			await upsertBudgetRow(database, budget);
		}

		await deleteCategoryRow(database, firstCategoryId);
		await deleteCategoryRow(database, secondCategoryId);
	});

	return mergedCategoryId;
};

const getCategoryMergeImpact = async (
	database: SQLiteDatabase,
	firstCategoryId: string,
	secondCategoryId: string,
): Promise<
	Readonly<{
		transactionCount: number;
		budgetCount: number;
	}>
> => {
	if (
		!firstCategoryId ||
		!secondCategoryId ||
		firstCategoryId === secondCategoryId
	) {
		return { transactionCount: 0, budgetCount: 0 };
	}

	const sourceCategoryIds = new Set([firstCategoryId, secondCategoryId]);
	const [transactions, budgets] = await Promise.all([
		getTransactionRows(database),
		getBudgetRows(database),
	]);

	const transactionCount = transactions.filter(
		(transaction) =>
			transaction.categoryId !== null &&
			sourceCategoryIds.has(transaction.categoryId),
	).length;
	const budgetCount = budgets.filter((budget) =>
		sourceCategoryIds.has(budget.categoryId),
	).length;

	return { transactionCount, budgetCount };
};

const setCategoryArchived = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
): Promise<void> => setCategoryArchivedRow(database, id, archived, Date.now());

const deleteCategory = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	try {
		await deleteCategoryRow(database, id);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
			throw new AppError(
				"CATEGORY_IN_USE",
				"Categories linked to transactions or budgets cannot be deleted.",
			);
		}
		throw error;
	}
};

const categoryService = {
	deleteCategory,
	getArchivedCategories,
	getCategories,
	getCategoryMergeImpact,
	getCategory,
	mergeCategories,
	saveCategory,
	setCategoryArchived,
};

export default categoryService;
