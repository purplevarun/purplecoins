import {
	BLUE_COLOR,
	GREEN_COLOR,
	RED_COLOR,
	YELLOW_COLOR,
} from "../config/colors.config";

enum TransactionType {
	INCOME = "INCOME",
	EXPENSE = "EXPENSE",
	TRANSFER = "TRANSFER",
	INVESTMENT = "INVESTMENT",
}

export const ExpenseData = {
	[TransactionType.EXPENSE]: { name: "Expense", color: RED_COLOR },
	[TransactionType.INCOME]: { name: "Income", color: GREEN_COLOR },
	[TransactionType.TRANSFER]: { name: "Transfer", color: BLUE_COLOR },
	[TransactionType.INVESTMENT]: { name: "Investment", color: YELLOW_COLOR },
};

export default TransactionType;
