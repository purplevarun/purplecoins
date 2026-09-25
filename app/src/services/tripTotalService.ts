import financeRepository from "@/repositories/financeRepository";
import type TripTotal from "@/types/TripTotal";
import type TripTotalRow from "@/types/TripTotalRow";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const { getTripTotalRows } = financeRepository;
const { subtractMoney, sumToMoney } = moneyUtils;

const buildTripTotals = (rows: readonly TripTotalRow[]): readonly TripTotal[] =>
	rows.map((row) => {
		const credits = sumToMoney(row.credits);
		const debits = sumToMoney(row.debits);
		return {
			tripId: row.tripId,
			currencyCode: row.currencyCode,
			credits,
			debits,
			total: subtractMoney(debits, credits),
		};
	});

const getTripTotals = async (
	database: SQLiteDatabase,
): Promise<readonly TripTotal[]> =>
	buildTripTotals(await getTripTotalRows(database));

const tripTotalService = {
	buildTripTotals,
	getTripTotals,
};

export default tripTotalService;
