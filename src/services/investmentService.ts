import type { SQLiteDatabase } from "expo-sqlite";

import { AppError } from "@/errors/AppError";
import {
	deleteSimpleEntityRow,
	getArchivedInvestmentRows,
	getInvestmentRow,
	getInvestmentRows,
	setSimpleEntityArchivedRow,
	simpleEntityNameExistsRow,
	upsertSimpleEntityRow,
} from "@/repositories/financeRepository";
import type { Investment } from "@/types/Investment";
import { createId } from "@/utils/id";

const mapInvestment = (investment: Investment): Investment => ({
	...investment,
	archived: Boolean(investment.archived),
});

const getInvestments = async (
	database: SQLiteDatabase,
): Promise<readonly Investment[]> =>
	(await getInvestmentRows(database)).map(mapInvestment);

const getArchivedInvestments = async (
	database: SQLiteDatabase,
): Promise<readonly Investment[]> =>
	(await getArchivedInvestmentRows(database)).map(mapInvestment);

const getInvestment = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Investment | null> => {
	const investment = await getInvestmentRow(database, id);
	return investment ? mapInvestment(investment) : null;
};

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
	if (
		await simpleEntityNameExistsRow(
			database,
			"investments",
			normalizedName,
			id,
		)
	) {
		throw new AppError(
			"INVESTMENT_NAME_DUPLICATE",
			`An investment named "${normalizedName}" already exists.`,
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

const setInvestmentArchived = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
): Promise<void> =>
	setSimpleEntityArchivedRow(
		database,
		"investments",
		id,
		archived,
		Date.now(),
	);

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

export {
	deleteInvestment,
	getArchivedInvestments,
	getInvestment,
	getInvestments,
	saveInvestment,
	setInvestmentArchived,
};
