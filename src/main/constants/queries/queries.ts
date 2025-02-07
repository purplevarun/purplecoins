const fetch_all_sources = `
SELECT * FROM "source"
`;

const fetch_source = `
SELECT * FROM "source" WHERE id = ?
;`;

const add_source = `
INSERT INTO "source" (id, name) VALUES (?,?)
;`;

const update_source = `
UPDATE "source" SET name=? WHERE id = ?
;`;

const delete_source = `
DELETE FROM "source" WHERE id = ?
;`;

const fetch_all_trips = `
SELECT * FROM "trip"
;`;

const fetch_trip = `
SELECT * FROM "trip" WHERE id = ?
;`;

const add_trip = `
INSERT INTO "trip" (id, name) VALUES (?,?)
;`;

const update_trip = `
UPDATE "trip" SET name=? WHERE id = ?
;`;

const delete_trip = `
DELETE FROM "trip" WHERE id = ?
;`;

const fetch_all_categories = `
SELECT 
    c.id, 
    c.name, 
    COUNT(tc.transactionId) AS transaction_count
FROM 
    "category" c
LEFT JOIN 
    "transaction_category" tc ON c.id = tc.categoryId
GROUP BY 
    c.id, c.name
ORDER BY 
    transaction_count DESC;
;`;

const fetch_category = `
SELECT * FROM "category" WHERE id = ?
;`;

const add_category = `
INSERT INTO "category" (id, name) VALUES (?,?)
;`;

const update_category = `
UPDATE "category" SET name=? WHERE id = ?
;`;

const delete_category = `
DELETE FROM "category" WHERE id = ?
;`;

const fetch_all_investments = `
SELECT * FROM "investment"
;`;

const fetch_investment = `
SELECT * FROM "investment" WHERE id = ?
;`;

const add_investment = `
INSERT INTO "investment" (id, name) VALUES (?,?)
;`;

const update_investment = `
UPDATE "investment" SET name=? WHERE id = ?
;`;

const delete_investment = `
DELETE FROM "investment" WHERE id = ?
;`;

const fetch_all_transactions = `
SELECT
	*
FROM
	"transaction"
ORDER BY
	date DESC
;`;

const fetch_transaction = `
SELECT
	*
FROM
	"transaction"
WHERE
	id = ?
;`;

const add_transaction = `
INSERT INTO
	"transaction" (id, amount, reason, type, action, date, sourceId, destinationId, investmentId) 
VALUES
	(?,?,?,?,?,?,?,?,?)
;`;

const delete_transaction = `
DELETE FROM
	"transaction"
WHERE
	id = ?
;`;

const delete_transaction_trip = `
DELETE FROM
	"transaction_trip"
WHERE
	transactionId = ?
;`;

const delete_transaction_category = `
DELETE FROM
	"transaction_category"
WHERE
	transactionId = ?
;`;

const add_transaction_trip = `
INSERT INTO
	"transaction_trip" (transactionId, tripId)
VALUES
	(?, ?)
;`;

const add_transaction_category = `
INSERT INTO
	"transaction_category" (transactionId, categoryId) 
VALUES
	(?, ?)
;`;

const fetch_transactions_for_source = `
SELECT
	*
FROM
	"transaction"
WHERE
	sourceId = ?
OR
	destinationId = ?
;`;

const fetch_transactions_for_investment = `
SELECT
	*
FROM
	"transaction"
WHERE
	investmentId = ?
;`;

const fetch_transactions_for_category = `
SELECT
	*
FROM
	"transaction"
JOIN
	"transaction_category"
ON
	"transaction".id = "transaction_category".transactionId
WHERE
	"transaction_category".categoryId = ?
;`;

const fetch_transactions_for_trip = `
SELECT
	*
FROM
	"transaction"
JOIN
	"transaction_trip"
ON
	"transaction".id = "transaction_trip".transactionId
WHERE
	"transaction_trip".tripId = ?
;`;

const fetch_total_for_source = `
WITH params(id) AS (SELECT ?)
SELECT COALESCE(
   SUM(
	   CASE
		   WHEN t.type = 'TRANSFER' AND t.sourceId = p.id THEN -t.amount
		   WHEN t.type = 'TRANSFER' AND t.destinationId = p.id THEN t.amount
		   WHEN t.action = 'CREDIT' THEN t.amount
		   WHEN t.action = 'DEBIT' THEN -t.amount
		   ELSE 0
		   END
   ), 0
) AS total
FROM "transaction" t, params p
WHERE t.sourceId = p.id OR t.destinationId = p.id;
`;

const fetch_total_for_investment = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
WHERE
    investmentId = ?
;`;

const fetch_total_for_category = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
JOIN
    "transaction_category"
ON
    "transaction".id = "transaction_category".transactionId
WHERE
    "transaction_category".categoryId = ?
;`;

const fetch_total_for_trip = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
JOIN
    "transaction_trip"
ON
    "transaction".id = "transaction_trip".transactionId
WHERE
    "transaction_trip".tripId = ?
;`;

const fetch_total_for_all = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
WHERE
	"transaction".type != 'TRANSFER'
;`;

const fetch_trips_for_transaction = `
SELECT tripId FROM "transaction_trip" WHERE transactionId = ?
`;

const fetch_categories_for_transaction = `
SELECT categoryId FROM "transaction_category" WHERE transactionId = ?
`;

const fetch_category_data_for_transaction_detail = `
SELECT c.* 
FROM "category" c
JOIN "transaction_category" tc ON c.id = tc.categoryId
WHERE tc.transactionId = ?
;`;

const fetch_trip_data_for_transaction_detail = `
SELECT t.* 
FROM "trip" t
JOIN "transaction_trip" tt ON t.id = tt.tripId
WHERE tt.transactionId = ?
;`;

const queries = {
	fetch_all_sources,
	fetch_source,
	add_source,
	update_source,
	delete_source,
	fetch_all_trips,
	fetch_trip,
	add_trip,
	update_trip,
	delete_trip,
	fetch_all_categories,
	fetch_category,
	add_category,
	update_category,
	delete_category,
	fetch_all_investments,
	fetch_investment,
	add_investment,
	update_investment,
	delete_investment,
	fetch_all_transactions,
	fetch_transaction,
	add_transaction,
	delete_transaction,
	delete_transaction_trip,
	delete_transaction_category,
	add_transaction_trip,
	add_transaction_category,
	fetch_transactions_for_source,
	fetch_transactions_for_investment,
	fetch_transactions_for_category,
	fetch_transactions_for_trip,
	fetch_total_for_source,
	fetch_total_for_investment,
	fetch_total_for_category,
	fetch_total_for_trip,
	fetch_total_for_all,
	fetch_trips_for_transaction,
	fetch_categories_for_transaction,
	fetch_category_data_for_transaction_detail,
	fetch_trip_data_for_transaction_detail,
};

export default queries;
