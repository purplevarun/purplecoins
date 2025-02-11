const drop_tables = ["transaction", "relation", "transaction_relation"].map(
	(tableName) => `DROP TABLE IF EXISTS "${tableName}";`,
);

export default drop_tables;
