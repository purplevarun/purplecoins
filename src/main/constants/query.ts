export const fetch_all_sources = `
SELECT * FROM "source"
`;

export const fetch_source = `
SELECT * FROM "source" WHERE id = ?
;`;

export const add_source = `
INSERT INTO "source" (id, name) VALUES (?,?)
;`;

export const update_source = `
UPDATE "source" SET name=? WHERE id = ?
;`;

export const delete_source = `
DELETE FROM "source" WHERE id = ?
;`;

export const fetch_all_trips = `
SELECT * FROM "trip"
;`;

export const fetch_trip = `
SELECT * FROM "trip" WHERE id = ?
;`;

export const add_trip = `
INSERT INTO "trip" (id, name) VALUES (?,?)
;`;

export const update_trip = `
UPDATE "trip" SET name=? WHERE id = ?
;`;

export const delete_trip = `
DELETE FROM "trip" WHERE id = ?
;`;

export const fetch_all_categories = `
SELECT * FROM "category"
;`;

export const fetch_category = `
SELECT * FROM "category" WHERE id = ?
;`;

export const add_category = `
INSERT INTO "category" (id, name) VALUES (?,?)
;`;

export const update_category = `
UPDATE "category" SET name=? WHERE id = ?
;`;

export const delete_category = `
DELETE FROM "category" WHERE id = ?
;`;

export const fetch_all_investments = `
SELECT * FROM "investment"
;`;

export const fetch_investment = `
SELECT * FROM "investment" WHERE id = ?
;`;

export const add_investment = `
INSERT INTO "investment" (id, name) VALUES (?,?)
;`;

export const update_investment = `
UPDATE "investment" SET name=? WHERE id = ?
;`;

export const delete_investment = `
DELETE FROM "investment" WHERE id = ?
;`;

export const fetch_all_transactions = `
SELECT
	*
FROM
	"transaction"
ORDER BY
	date DESC
;`;

export const fetch_transaction = `
SELECT
	*
FROM
	"transaction"
WHERE
	id = ?
;`;

export const add_transaction = `
INSERT INTO
	"transaction" (id, amount, reason, type, action, date, sourceId, destinationId, investmentId) 
VALUES
	(?,?,?,?,?,?,?,?,?)
;`;

export const delete_transaction = `
DELETE FROM
	"transaction"
WHERE
	id = ?
;`;

export const delete_transaction_trip = `
DELETE FROM
	"transaction_trip"
WHERE
	transactionId = ?
;`;

export const delete_transaction_category = `
DELETE FROM
	"transaction_category"
WHERE
	transactionId = ?
;`;

export const add_transaction_trip = `
INSERT INTO
	"transaction_trip" (transactionId, tripId)
VALUES
	(?, ?)
;`;

export const add_transaction_category = `
INSERT INTO
	"transaction_category" (transactionId, categoryId) 
VALUES
	(?, ?)
;`;

export const fetch_transactions_for_source = `
SELECT
	*
FROM
	"transaction"
WHERE
	sourceId = ?
;`;

export const fetch_transactions_for_investment = `
SELECT
	*
FROM
	"transaction"
WHERE
	investmentId = ?
;`;

export const fetch_transactions_for_category = `
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

export const fetch_transactions_for_trip = `
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

export const fetch_total_for_source = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
WHERE
    sourceId = ?
;`;

export const fetch_total_for_investment = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
WHERE
    investmentId = ?
;`;

export const fetch_total_for_category = `
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

export const fetch_total_for_trip = `
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

export const fetch_total_for_all = `
SELECT
    SUM(CASE WHEN "transaction".action = 'CREDIT' THEN "transaction".amount ELSE -"transaction".amount END) as total
FROM
    "transaction"
;`;

export const fetch_trips_for_transaction = `
SELECT tripId FROM "transaction_trip" WHERE transactionId = ?
`;

export const fetch_categories_for_transaction = `
SELECT categoryId FROM "transaction_category" WHERE transactionId = ?
`;
