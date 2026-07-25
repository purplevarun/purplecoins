import financeRepository from "@/repositories/financeRepository";
import type Category from "@/types/Category";
import type Investment from "@/types/Investment";
import type Source from "@/types/Source";
import type Trip from "@/types/Trip";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	createSourceRow,
	setCategoryArchivedRow,
	setSimpleEntityArchivedRow,
	setSourceArchivedRow,
	upsertCategoryRow,
	upsertSimpleEntityRow,
} = financeRepository;

/**
 * Test data factories for the finance domain's "relation" entities
 * (sources, categories, trips, investments). These insert directly through
 * the repository layer (bypassing service-level validation) so that other
 * layers (services, other repositories) can be tested against a
 * ready-made, foreign-key-valid fixture without depending on the very
 * service under test.
 *
 * Note: the underlying `create`/`upsert*Row` repository functions never
 * write the `archived` column (only the dedicated `set*ArchivedRow`
 * functions do, matching production code paths). When an override requests
 * `archived: true`, these factories apply it as a follow-up call so the
 * fixture behaves exactly like a real archived record.
 */

let uniqueSuffix = 0;
const nextSuffix = (): number => {
	uniqueSuffix += 1;
	return uniqueSuffix;
};

const insertSource = async (
	database: SQLiteDatabase,
	overrides: Partial<Source> = {},
): Promise<Source> => {
	const now = Date.now();
	const suffix = nextSuffix();
	const source: Source = {
		id: `source-${suffix}`,
		name: `Test Source ${suffix}`,
		currencyCode: "INR",
		validatedAt: null,
		createdAt: now,
		updatedAt: now,
		latestTransactionCreatedAt: null,
		balance: "0",
		archived: false,
		...overrides,
	};
	await createSourceRow(database, source);
	if (source.archived) {
		await setSourceArchivedRow(database, source.id, true, now);
	}
	return source;
};

const insertCategory = async (
	database: SQLiteDatabase,
	overrides: Partial<Category> = {},
): Promise<Category> => {
	const now = Date.now();
	const suffix = nextSuffix();
	const category: Category = {
		id: `category-${suffix}`,
		name: `Test Category ${suffix}`,
		isIncome: false,
		createdAt: now,
		updatedAt: now,
		archived: false,
		...overrides,
	};
	await upsertCategoryRow(database, category);
	if (category.archived) {
		await setCategoryArchivedRow(database, category.id, true, now);
	}
	return category;
};

const insertTrip = async (
	database: SQLiteDatabase,
	overrides: Partial<Trip> = {},
): Promise<Trip> => {
	const now = Date.now();
	const suffix = nextSuffix();
	const trip: Trip = {
		id: `trip-${suffix}`,
		name: `Test Trip ${suffix}`,
		createdAt: now,
		updatedAt: now,
		archived: false,
		...overrides,
	};
	await upsertSimpleEntityRow(database, "trips", trip);
	if (trip.archived) {
		await setSimpleEntityArchivedRow(database, "trips", trip.id, true, now);
	}
	return trip;
};

const insertInvestment = async (
	database: SQLiteDatabase,
	overrides: Partial<Investment> = {},
): Promise<Investment> => {
	const now = Date.now();
	const suffix = nextSuffix();
	const investment: Investment = {
		id: `investment-${suffix}`,
		name: `Test Investment ${suffix}`,
		createdAt: now,
		updatedAt: now,
		archived: false,
		...overrides,
	};
	await upsertSimpleEntityRow(database, "investments", investment);
	if (investment.archived) {
		await setSimpleEntityArchivedRow(
			database,
			"investments",
			investment.id,
			true,
			now,
		);
	}
	return investment;
};

const dbFixtures = {
	insertCategory,
	insertInvestment,
	insertSource,
	insertTrip,
};

export default dbFixtures;
