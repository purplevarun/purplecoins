import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import RelationType from "../constants/enums/RelationType";
import TransactionAction from "../constants/enums/TransactionAction";
import TransactionRelationType from "../constants/enums/TransactionRelationType";
import TransactionType from "../constants/enums/TransactionType";
import LinkedRelation from "../models/LinkedRelation";
import Relation from "../models/Relation";
import Transaction from "../models/Transaction";
import RelationWithTotal from "../types/RelationWithTotal";
import { calculateTotal, convertStringToDate } from "../util/HelperFunctions";

const useDatabase = () => {
	const db = useSQLiteContext();

	const fetchAllRelations = (relationType: RelationType) => {
		const query = `SELECT * FROM "relation" WHERE type = ?`;
		return db.getAllSync<Relation>(query, [relationType]);
	};

	const fetchRelation = (relationId: string) => {
		const query = `SELECT * FROM "relation" WHERE id = ?`;
		return db.getFirstSync<Relation>(query, [relationId])!;
	};

	const addRelation = (relationName: string, relationType: RelationType) => {
		const query = `INSERT INTO "relation" VALUES (?, ?, ?)`;
		db.runSync(query, [randomUUID(), relationName, relationType]);
	};

	const updateRelation = (relationId: string, relationName: string) => {
		const query = `UPDATE "relation" SET name = ? WHERE id = ?`;
		db.runSync(query, [relationName, relationId]);
	};

	const deleteRelation = (relationId: string) => {
		const query = `DELETE FROM "relation" WHERE id = ?`;
		db.runSync(query, [relationId]);
	};

	const fetchAllTransactions = () => {
		const query = `SELECT * FROM "transaction" ORDER BY date DESC`;
		return db.getAllSync<Transaction>(query);
	};

	const fetchTransaction = (transactionId: string) => {
		const query = `SELECT * FROM "transaction" WHERE id = ?`;
		return db.getFirstSync<Transaction>(query, [transactionId])!;
	};

	const addTransactionRelation = (
		transactionId: string,
		relationId: string,
		transactionRelationType: TransactionRelationType,
	) => {
		const query = `INSERT INTO "transaction_relation" VALUES (?, ?, ?)`;
		db.runSync(query, [transactionId, relationId, transactionRelationType]);
	};

	const deleteRelationsForTransaction = (transactionId: string) => {
		const query = `DELETE FROM "transaction_relation" WHERE transaction_id = ?`;
		db.runSync(query, [transactionId]);
	};

	const addTransaction = (
		amount: number,
		reason: string,
		action: TransactionAction,
		type: TransactionType,
		date: Date,
	) => {
		const query = `INSERT INTO "transaction" VALUES (?, ?, ?, ?, ?, ?)`;
		const transactionId = randomUUID();
		db.runSync(query, [
			transactionId,
			amount,
			reason,
			type,
			action,
			date.getTime(),
		]);
		return transactionId;
	};

	const deleteTransaction = (transactionId: string) => {
		const query = `DELETE FROM "transaction" WHERE id = ?`;
		db.runSync(query, [transactionId]);
	};

	const fetchTransactionsForRelation = (relationId: string) => {
		const query = `SELECT "transaction".* FROM "transaction" JOIN "transaction_relation" ON "transaction".id = "transaction_relation".transaction_id WHERE "transaction_relation".relation_id = ? ORDER BY "transaction".date DESC`;
		return db.getAllSync<Transaction>(query, [relationId]);
	};

	const fetchTransactionsForRelationBetweenDate = (
		relationId: string,
		startDate: number,
		endDate: number,
	) => {
		const query = `SELECT "transaction".* FROM "transaction" JOIN "transaction_relation" ON "transaction".id = "transaction_relation".transaction_id WHERE "transaction_relation".relation_id = ? AND "transaction".date BETWEEN ? AND ? ORDER BY "transaction".date DESC`;
		return db.getAllSync<Transaction>(query, [
			relationId,
			startDate,
			endDate,
		]);
	};

	const updateTransaction = (
		transactionId: string,
		amount: number,
		reason: string,
		action: TransactionAction,
		type: TransactionType,
		date: Date,
	) => {
		const query = `UPDATE "transaction" SET amount = ?, reason = ?, action = ?, type = ?, date = ? WHERE id = ?`;
		db.runSync(query, [
			amount,
			reason,
			action,
			type,
			date.getTime(),
			transactionId,
		]);
	};

	const fetchRelationsForTransaction = (transactionId: string) => {
		const query = `SELECT "relation".id, "relation".name, "transaction_relation".type FROM "relation" JOIN "transaction_relation" ON "relation".id = "transaction_relation".relation_id WHERE "transaction_relation".transaction_id = ?;`;
		return db.getAllSync<LinkedRelation>(query, [transactionId]).reduce(
			(acc, relation) => {
				(acc[relation.type] ||= []).push(relation);
				return acc;
			},
			{} as Record<TransactionRelationType, LinkedRelation[]>,
		);
	};

	const fetchBreakdown = (startDate: string, endDate: string) => {
		const categories = fetchAllRelations(RelationType.CATEGORY);
		const breakdown: Record<string, RelationWithTotal> = {};
		categories.forEach((category) => {
			const transactions = fetchTransactionsForRelationBetweenDate(
				category.id,
				convertStringToDate(startDate).getTime(),
				convertStringToDate(endDate).getTime(),
			);
			if (transactions.length !== 0) {
				const categoryBreakdown = (breakdown[category.id] ||=
					defaultBreakdownObject);
				categoryBreakdown.total += calculateTotal(transactions);
				categoryBreakdown.id = category.id;
				categoryBreakdown.name = category.name;
			}
		});
		return Object.values(breakdown);
	};

	return {
		fetchAllRelations,
		fetchRelation,
		addRelation,
		updateRelation,
		deleteRelation,
		fetchAllTransactions,
		fetchTransaction,
		addTransactionRelation,
		addTransaction,
		deleteTransaction,
		updateTransaction,
		fetchTransactionsForRelation,
		fetchRelationsForTransaction,
		deleteRelationsForTransaction,
		fetchBreakdown,
	};
};

const defaultBreakdownObject = {
	total: 0,
	name: "",
	id: "",
	type: RelationType.CATEGORY,
};

export default useDatabase;
