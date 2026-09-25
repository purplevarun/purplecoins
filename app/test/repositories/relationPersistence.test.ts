import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import attachmentRepository from "@/repositories/attachmentRepository";
import financeRepository from "@/repositories/financeRepository";
import platformRepository from "@/repositories/platformRepository";
import investmentTypeService from "@/services/investmentTypeService";
import platformService from "@/services/platformService";
import tripTypeService from "@/services/tripTypeService";
import createTestDatabase from "@test/helpers/sqliteTestDatabase";
import { randomUUID } from "node:crypto";
import { expect, it, vi } from "vitest";

vi.mock("@/utils/id", () => ({ default: () => randomUUID() }));

it("replaces receipts and handles optional relation updates", async () => {
	const { database } = createTestDatabase();
	await database.execAsync(SCHEMA_SQL);
	for (const migration of SCHEMA_MIGRATIONS)
		await database.execAsync(migration);
	const entity = { id: "id", name: "Name", createdAt: 1, updatedAt: 2 };
	await financeRepository.upsertSimpleEntityRow(
		database,
		"investments",
		entity,
	);
	await financeRepository.upsertSimpleEntityRow(
		database,
		"investments",
		entity,
	);
	await financeRepository.upsertInvestmentRow(database, {
		...entity,
		investmentTypeId: null,
	});
	await financeRepository.upsertInvestmentRow(database, {
		...entity,
		id: "new",
		investmentTypeId: null,
	});
	await financeRepository.upsertSimpleEntityRow(database, "trips", entity);
	await financeRepository.upsertSimpleEntityRow(database, "trips", entity);
	const attachment = {
		fileName: "receipt",
		mimeType: "text/plain",
		sizeBytes: 1,
		content: new Uint8Array([1]),
	};
	await attachmentRepository.upsertAttachmentRow(
		database,
		"receipt",
		"TRANSACTION",
		"payment",
		attachment,
		1,
	);
	await attachmentRepository.upsertAttachmentRow(
		database,
		"other",
		"TRANSACTION",
		"payment",
		{ ...attachment, content: new Uint8Array([2]) },
		2,
	);
	expect(
		await attachmentRepository.getAttachmentContentRow(
			database,
			"TRANSACTION",
			"payment",
		),
	).toEqual(new Uint8Array([2]));
});

it("validates relation names and protects relations in use", async () => {
	const { database } = createTestDatabase();
	await database.execAsync(SCHEMA_SQL);
	for (const migration of SCHEMA_MIGRATIONS)
		await database.execAsync(migration);
	for (const service of [
		{
			save: platformService.savePlatform,
			list: platformService.getPlatforms,
			remove: platformService.deletePlatform,
			code: "PLATFORM",
			link: "INSERT INTO investments (id, platform_id) VALUES ('linked', ?)",
		},
		{
			save: tripTypeService.saveTripType,
			list: tripTypeService.getTripTypes,
			remove: tripTypeService.deleteTripType,
			code: "TRIP_TYPE",
			link: "INSERT INTO trips (id, trip_type_id) VALUES ('linked', ?)",
		},
		{
			save: investmentTypeService.saveInvestmentType,
			list: investmentTypeService.getInvestmentTypes,
			remove: investmentTypeService.deleteInvestmentType,
			code: "INVESTMENT_TYPE",
			link: "INSERT INTO investments (id, investment_type_id) VALUES ('linked', ?)",
		},
	]) {
		await expect(service.save(database, " ")).rejects.toMatchObject({
			code: `${service.code}_NAME_REQUIRED`,
		});
		const id = await service.save(database, "  Example  ");
		expect(await service.list(database)).toMatchObject([
			{ id, name: "Example" },
		]);
		await expect(service.save(database, "example")).rejects.toMatchObject({
			code: `${service.code}_NAME_DUPLICATE`,
		});
		await database.runAsync(service.link, id);
		await expect(service.remove(database, id)).rejects.toMatchObject({
			code: `${service.code}_IN_USE`,
		});
		await database.runAsync("DELETE FROM investments WHERE id = 'linked'");
		await database.runAsync("DELETE FROM trips WHERE id = 'linked'");
		await service.remove(database, id);
		expect(await service.list(database)).toEqual([]);
	}
});

it("archives and restores platforms", async () => {
	const { database } = createTestDatabase();
	await database.execAsync(SCHEMA_SQL);
	const id = await platformService.savePlatform(database, "Broker");
	await platformService.setPlatformArchived(database, id, true);
	expect(await platformRepository.getPlatformRow(database, id)).toMatchObject(
		{ archived: 1 },
	);
	await platformService.setPlatformArchived(database, id, false);
	expect(await platformRepository.getPlatformRow(database, id)).toMatchObject(
		{ archived: 0 },
	);
});

it("creates and updates platforms without unique constraints", async () => {
	const { database } = createTestDatabase();
	await database.execAsync(SCHEMA_SQL);
	const platform = {
		id: "platform-id",
		name: "Broker",
		createdAt: 1,
		updatedAt: 1,
	};
	await platformRepository.upsertPlatformRow(database, platform);
	await platformRepository.upsertPlatformRow(database, {
		...platform,
		name: "Renamed",
		createdAt: 2,
		updatedAt: 3,
	});
	expect(await platformRepository.getPlatformRows(database)).toEqual([
		{ ...platform, name: "Renamed", updatedAt: 3, archived: 0 },
	]);
});

it("persists investment types and linked investments without unique constraints", async () => {
	const { database } = createTestDatabase();
	await database.execAsync(SCHEMA_SQL);
	for (const migration of SCHEMA_MIGRATIONS)
		await database.execAsync(migration);
	const type = { id: "type-id", name: "Stocks", createdAt: 1, updatedAt: 1 };
	await financeRepository.upsertInvestmentTypeRow(database, type);
	await financeRepository.upsertInvestmentTypeRow(database, {
		...type,
		name: "Equity",
		createdAt: 2,
		updatedAt: 3,
	});
	expect(await financeRepository.getInvestmentTypeRows(database)).toEqual([
		{ ...type, name: "Equity", updatedAt: 3 },
	]);
	await platformRepository.upsertPlatformRow(database, {
		...type,
		id: "platform-id",
		name: "Broker",
	});
	const investment = {
		id: "investment-id",
		name: "Fund",
		investmentTypeId: type.id,
		platformId: "platform-id",
		createdAt: 1,
		updatedAt: 1,
	};
	await financeRepository.upsertInvestmentRow(database, investment);
	await financeRepository.upsertInvestmentRow(database, {
		...investment,
		name: "Renamed fund",
		createdAt: 2,
		updatedAt: 3,
	});
	expect(await financeRepository.getInvestmentRows(database)).toEqual([
		{
			...investment,
			name: "Renamed fund",
			updatedAt: 3,
			investmentTypeName: "Equity",
			platformName: "Broker",
			archived: 0,
		},
	]);
});

it("preserves the selected trip type when creating and editing a trip", async () => {
	const { database } = createTestDatabase();
	await database.execAsync(SCHEMA_SQL);
	for (const migration of SCHEMA_MIGRATIONS)
		await database.execAsync(migration);
	await database.runAsync(
		"INSERT INTO trip_types (id, name) VALUES (?, ?)",
		"trip-type",
		"Holiday",
	);
	const trip = {
		id: "trip-id",
		name: "Trip",
		tripTypeId: "trip-type",
		createdAt: 1,
		updatedAt: 1,
	};
	await financeRepository.upsertSimpleEntityRow(database, "trips", trip);
	await financeRepository.upsertSimpleEntityRow(database, "trips", {
		...trip,
		name: "Updated trip",
		updatedAt: 2,
	});
	expect(await financeRepository.getTripRows(database)).toEqual([
		{
			...trip,
			name: "Updated trip",
			updatedAt: 2,
			tripTypeName: "Holiday",
			archived: 0,
		},
	]);
});
