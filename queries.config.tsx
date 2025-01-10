export const insert_transaction = `
	INSERT
	INTO "transaction" (id, sourceId, amount, reason, type, date, destinationId, investmentId) 
	VALUES (?,?,?,?,?,?,?,?);
`;

export const update_source_add_current_amount = `
	UPDATE source
	SET currentAmount=currentAmount-? 
	WHERE id=?;
`;

export const update_source_deduct_current_amount = `
	UPDATE source
	SET currentAmount=currentAmount+? 
	WHERE id=?;
`;

export const update_investment_amount = `
	UPDATE investment
	SET investedAmount=investedAmount+? 
	WHERE id=?;
`;

export const insert_transaction_trip = `
	INSERT
	INTO transaction_trip (transactionId, tripId)
	VALUES (?, ?);
`;

export const insert_transaction_category = `
	INSERT
	INTO transaction_category (transactionId, categoryId) 
	VALUES (?, ?);
`;

export const fetch_single_detailed_transaction = `
	SELECT
	t.id,
	t.amount,
	t.reason,
	t.type,
	t.date,
	s.id AS sourceId,
	s.name AS source,
	d.id AS destinationId,
	d.name AS destination,
	i.id AS investmentId,
	i.name AS investment,
	CASE WHEN COUNT(c.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', c.name,'id', c.id)) ELSE NULL END AS categories,
	CASE WHEN COUNT(trip.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', trip.name,'id', trip.id)) ELSE NULL END AS trips
	FROM "transaction" t
	LEFT JOIN transaction_category tc ON t.id = tc.transactionId
	LEFT JOIN category c ON tc.categoryId = c.id
	LEFT JOIN transaction_trip tt ON t.id = tt.transactionId
	LEFT JOIN trip ON tt.tripId = trip.id
	LEFT JOIN source s ON t.sourceId = s.id
	LEFT JOIN source d ON t.destinationId = d.id
	LEFT JOIN investment i ON t.investmentId = i.id
	WHERE t.id = ?;
`;

export const fetch_all_detailed_transactions = `
	SELECT
	t.id,
	t.amount,
	t.reason,
	t.type,
	t.date,
	s.name AS source,
	d.name AS destination,
	i.name AS investment,
	CASE WHEN COUNT(c.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', c.name)) ELSE NULL END AS categories,
	CASE WHEN COUNT(trip.id) > 0 THEN JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('name', trip.name)) ELSE NULL END AS trips
	FROM "transaction" t
	LEFT JOIN transaction_category tc ON t.id = tc.transactionId
	LEFT JOIN category c ON tc.categoryId = c.id
	LEFT JOIN transaction_trip tt ON t.id = tt.transactionId
	LEFT JOIN trip ON tt.tripId = trip.id
	LEFT JOIN source s ON t.sourceId = s.id
	LEFT JOIN source d ON t.destinationId = d.id
	LEFT JOIN investment i ON t.investmentId = i.id
	GROUP BY t.id
	ORDER BY t.date DESC;
`;

export const update_transaction = `
	UPDATE "transaction"
	SET 
		sourceId = ?, 
		amount = ?, 
		reason = ?, 
		type = ?, 
		date = ?, 
		destinationId = ?, 
		investmentId = ?
	WHERE 
		id = ?;
`;

export const delete_transaction_trips = `
	DELETE
	FROM transaction_trip
	WHERE transactionId=?;
`;

export const delete_transaction_categories = `
	DELETE
	FROM transaction_category
	WHERE transactionId=?;
`;

export const delete_queries = [
	`DELETE FROM "transaction";`,
	`DELETE FROM category;`,
	`DELETE FROM source;`,
	`DELETE FROM trip;`,
	`DELETE FROM investment;`,
	`DELETE FROM transaction_trip;`,
	`DELETE FROM transaction_category;`,
];
