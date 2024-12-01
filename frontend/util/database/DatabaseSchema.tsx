import ExpenseType from "../../types/ExpenseType";

export interface IUser {
	id: string;
	name: string;
}

export interface ISource {
	id: string;
	userId: string;
	name: string;
	initialAmount: number;
	currentAmount: number;
}

export interface ICategory {
	id: string;
	userId: string;
	name: string;
	type: ExpenseType;
	monthlyBudget?: number;
	annualBudget?: number;
}

export interface IInvestment {
	id: string;
	userId: string;
	name: string;
	investedAmount: number;
	currentAmount: number;
}

export interface ITrip {
	id: string;
	userId: string;
	name: string;
	startDate?: Date;
	endDate?: Date;
}

export interface ITransaction {
	id: string;
	userId: string;
	sourceId: string;
	destinationId?: string;
	investmentId?: string;
	amount: number;
	reason: string;
	type: ExpenseType;
	date: Date;
}

export interface ITransactionData {
	id: string;
	userId: string;
	sourceId: string;
	destinationId?: string;
	investmentId?: string;
	amount: number;
	reason: string;
	type: ExpenseType;
	date: Date;
	categories: ICategory[];
	trips: ITrip[];
}

export interface ITransactionTrip {
	transactionId: string;
	tripId: string;
}

export interface ITransactionCategory {
	transactionId: string;
	categoryId: string;
}