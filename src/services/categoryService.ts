import type { SQLiteDatabase } from "expo-sqlite";

import { AppError } from "@/errors/AppError";
import {
	deleteCategoryRow,
	getCategoryRow,
	getCategoryRows,
	upsertCategoryRow,
} from "@/repositories/financeRepository";
import type { Category } from "@/types/Category";
import { createId } from "@/utils/id";

const mapCategory = (category: Category): Category => ({
	...category,
	isIncome: Boolean(category.isIncome),
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

const saveCategory = async (
	database: SQLiteDatabase,
	id: string | undefined,
	name: string,
	isIncome: boolean,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"CATEGORY_NAME_REQUIRED",
			"Category name is required.",
		);
	}
	const now = Date.now();
	const existingCategory = id ? await getCategoryRow(database, id) : null;
	const categoryId = id ?? createId();
	await upsertCategoryRow(database, {
		id: categoryId,
		name: normalizedName,
		isIncome,
		createdAt: existingCategory?.createdAt ?? now,
		updatedAt: now,
	});
	return categoryId;
};

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

export { deleteCategory, getCategories, getCategory, saveCategory };
