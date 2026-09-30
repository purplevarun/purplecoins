import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import type Category from "@/types/Category";
import type CategoryKind from "@/types/CategoryKind";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	categoryInUseRow,
	categoryNameExistsRow,
	deleteCategoryRow,
	getArchivedCategoryRows,
	getCategoryRow,
	getCategoryRows,
	setCategoryArchivedRow,
	upsertCategoryRow,
} = financeRepository;

const mapCategory = (category: Category): Category => ({
	...category,
	isIncome: category.kind === "INCOME",
	archived: Boolean(category.archived),
});

const getCategories = async (
	database: SQLiteDatabase,
	kind?: CategoryKind,
): Promise<readonly Category[]> => {
	const categories = await getCategoryRows(database, kind);
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
	kind: CategoryKind,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"CATEGORY_NAME_REQUIRED",
			"Category name is required.",
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
		kind,
		isIncome: kind === "INCOME",
		createdAt: existingCategory?.createdAt ?? now,
		updatedAt: now,
		archived: existingCategory?.archived ?? false,
	});
	return categoryId;
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
	if (await categoryInUseRow(database, id)) {
		throw new AppError(
			"CATEGORY_IN_USE",
			"Category is referenced by transactions or budgets and cannot be deleted.",
		);
	}
	await deleteCategoryRow(database, id);
};

const categoryService = {
	deleteCategory,
	getArchivedCategories,
	getCategories,
	getCategory,
	saveCategory,
	setCategoryArchived,
};

export default categoryService;
