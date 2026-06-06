import type { SQLiteDatabase } from "expo-sqlite";

import { AppError } from "@/errors/AppError";
import {
	deleteSimpleEntityRow,
	getInvestmentRow,
	getInvestmentRows,
	upsertSimpleEntityRow,
} from "@/repositories/financeRepository";
import type { Investment } from "@/types/Investment";
import { createId } from "@/utils/id";

const getInvestments = async (
	database: SQLiteDatabase,
): Promise<readonly Investment[]> => getInvestmentRows(database);

const getInvestment = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Investment | null> => getInvestmentRow(database, id);

const saveInvestment = async (
	database: SQLiteDatabase,
	id: string | undefined,
	name: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"INVESTMENT_NAME_REQUIRED",
			"Investment name is required.",
		);
	}
	const now = Date.now();
	const existingInvestment = id ? await getInvestmentRow(database, id) : null;
	const investmentId = id ?? createId();
	await upsertSimpleEntityRow(database, "investments", {
		id: investmentId,
		name: normalizedName,
		createdAt: existingInvestment?.createdAt ?? now,
		updatedAt: now,
	});
	return investmentId;
};

const deleteInvestment = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	try {
		await deleteSimpleEntityRow(database, "investments", id);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
			throw new AppError(
				"INVESTMENT_IN_USE",
				"Investments linked to transactions cannot be deleted.",
			);
		}
		throw error;
	}
};

export { deleteInvestment, getInvestment, getInvestments, saveInvestment };
