import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import type InvestmentType from "@/types/InvestmentType";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	getInvestmentTypeRows,
	investmentTypeNameExistsRow,
	upsertInvestmentTypeRow,
} = financeRepository;

const getInvestmentTypes = async (
	database: SQLiteDatabase,
): Promise<readonly InvestmentType[]> => getInvestmentTypeRows(database);

const saveInvestmentType = async (
	database: SQLiteDatabase,
	name: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"INVESTMENT_TYPE_NAME_REQUIRED",
			"Investment type name is required.",
		);
	}
	if (await investmentTypeNameExistsRow(database, normalizedName)) {
		throw new AppError(
			"INVESTMENT_TYPE_NAME_DUPLICATE",
			`An investment type named "${normalizedName}" already exists.`,
		);
	}
	const now = Date.now();
	const id = createId();
	await upsertInvestmentTypeRow(database, {
		id,
		name: normalizedName,
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const investmentTypeService = {
	getInvestmentTypes,
	saveInvestmentType,
};

export default investmentTypeService;
