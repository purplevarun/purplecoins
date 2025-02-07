const tableNames = [
	"transaction",
	"category",
	"trip",
	"investment",
	"source",
	"transaction_trip",
	"transaction_category",
];

const drop_tables = tableNames.map(
	(tableName) => `DROP TABLE IF EXISTS "${tableName}";`,
);

export default drop_tables;
