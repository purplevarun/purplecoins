import Decimal from "decimal.js";

import AppError from "@/errors/AppError";

const MONEY_PATTERN = /^\d+(?:\.\d+)?$/;
const ZERO_AMOUNT = "0";

const normalizeMoney = (value: string): string => {
	const trimmedValue = value.trim();
	if (!MONEY_PATTERN.test(trimmedValue)) {
		throw new AppError("INVALID_AMOUNT", "Enter a valid positive amount.");
	}

	const amount = new Decimal(trimmedValue);
	if (!amount.isPositive()) {
		throw new AppError(
			"INVALID_AMOUNT",
			"Amount must be greater than zero.",
		);
	}
	return amount.toFixed();
};

const addMoney = (left: string, right: string): string =>
	new Decimal(left).plus(right).toFixed();

const subtractMoney = (left: string, right: string): string =>
	new Decimal(left).minus(right).toFixed();

const multiplyMoney = (amount: string, multiplier: string): string =>
	new Decimal(amount).times(multiplier).toFixed();

const compareMoney = (left: string, right: string): number =>
	new Decimal(left).comparedTo(right);

const absoluteMoney = (amount: string): string =>
	new Decimal(amount).abs().toFixed();

const sumMoney = (amounts: readonly string[]): string =>
	amounts.reduce(addMoney, ZERO_AMOUNT);

const formatMoney = (amount: string, currencyCode: string): string => {
	const numericAmount = new Decimal(amount).toNumber();
	try {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: currencyCode,
			maximumFractionDigits: 2,
		}).format(numericAmount);
	} catch (error: unknown) {
		if (error instanceof RangeError) {
			return `${currencyCode} ${new Decimal(amount).toFixed(2)}`;
		}
		throw error;
	}
};

const moneyUtils = {
	absoluteMoney,
	addMoney,
	compareMoney,
	formatMoney,
	multiplyMoney,
	normalizeMoney,
	subtractMoney,
	sumMoney,
	ZERO_AMOUNT,
};

export default moneyUtils;
