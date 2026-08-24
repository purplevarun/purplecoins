type TripTotal = Readonly<{
	tripId: string;
	currencyCode: string;
	credits: string;
	debits: string;
	total: string;
}>;

export type { TripTotal };
