import TransactionType from "./TransactionType";

interface ICategory {
	id: string;
	name: string;
	type: TransactionType;
	monthlyBudget?: number;
	annualBudget?: number;
}

export default ICategory;
