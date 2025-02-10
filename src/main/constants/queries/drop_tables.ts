const tableNames = [
	"transaction",
	"transaction",
	"relation",
	"transaction_relation",
];

const drop_tables = tableNames.map(
	(tableName) => `DROP TABLE IF EXISTS "${tableName}";`,
);

export default drop_tables;
