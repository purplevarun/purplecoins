import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { convertStringToDate } from "./HelperFunctions";
import LinkedRelation from "./LinkedRelation";
import Relation from "./Relation";
import RelationType from "./RelationType";
import Transaction from "./Transaction";
import TransactionAction from "./TransactionAction";
import TransactionRelationType from "./TransactionRelationType";
import TransactionType from "./TransactionType";

const useDatabase = () => {
	const db = useSQLiteContext();

	const fetchAllRelations = (
		relationType: RelationType,
		startDate?: string,
		endDate?: string,
	) => {
		if (startDate && endDate) {
			const query = `
			SELECT r.*, COALESCE(SUM(
				CASE
					WHEN t.type = 'TRANSFER' THEN 
						CASE WHEN tr.type = 'TRANSACTION_DESTINATION' THEN t.amount ELSE -t.amount END
					WHEN t.action = 'CREDIT' THEN t.amount
					ELSE -t.amount
				END
			), 0) AS total
			FROM "relation" r
			LEFT JOIN "transaction_relation" tr ON r.id = tr.relation_id
			LEFT JOIN "transaction" t ON tr.transaction_id = t.id
			WHERE r.type = ?
			AND t.date >= ? AND t.date <= ?
			GROUP BY r.id
			ORDER BY total
			;`;
			return db.getAllSync<Relation & { total: number }>(query, [
				relationType,
				convertStringToDate(startDate).getTime(),
				convertStringToDate(endDate).getTime(),
			]);
		} else {
			const query = `
			SELECT r.*, COALESCE(SUM(
				CASE
					WHEN t.type = 'TRANSFER' THEN 
						CASE WHEN tr.type = 'TRANSACTION_DESTINATION' THEN t.amount ELSE -t.amount END
					WHEN t.action = 'CREDIT' THEN t.amount
					ELSE -t.amount
				END
			), 0) AS total
			FROM "relation" r
			LEFT JOIN "transaction_relation" tr ON r.id = tr.relation_id
			LEFT JOIN "transaction" t ON tr.transaction_id = t.id
			WHERE r.type = ?
			GROUP BY r.id
			ORDER BY total
			;`;
			return db.getAllSync<Relation & { total: number }>(query, [
				relationType,
			]);
		}
	};

	const fetchRelation = (relationId: string) => {
		const query = `SELECT * FROM "relation" WHERE id = ?`;
		return db.getFirstSync<Relation>(query, [relationId])!;
	};

	const addRelation = (relationName: string, relationType: RelationType) => {
		const query = `INSERT INTO "relation" VALUES (?, ?, ?)`;
		db.runSync(query, [randomUUID(), relationName.trim(), relationType]);
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
		const query = `
		SELECT * FROM "transaction" ORDER BY date DESC;
		`;
		return db.getAllSync<Transaction & { total: number }>(query);
	};

	const fetchTotalForSource = () => {
		const query = `
		SELECT
		COALESCE(SUM(
			CASE 
				WHEN type = 'TRANSFER' THEN 0
				WHEN action = 'DEBIT' THEN -amount
				ELSE amount
			END
		), 0) AS total
		FROM "transaction"
	`;
		return db.getFirstSync<{ total: number }>(query);
	};

	const fetchTotalForInvestment = () => {
		const query = `
		SELECT
		COALESCE(SUM(
			CASE 
				WHEN action = 'DEBIT' THEN -amount
				ELSE amount
			END
		), 0) AS total
		FROM "transaction"
		WHERE type = 'INVESTMENT'
	`;
		return db.getFirstSync<{ total: number }>(query);
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
			reason.trim(),
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
		fetchTotalForSource,
		fetchTotalForInvestment,
	};
};

export default useDatabase;
