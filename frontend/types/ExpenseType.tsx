import {
	BLUE_COLOR,
	GREEN_COLOR,
	RED_COLOR,
	YELLOW_COLOR,
} from "../config/colors.config";

enum ExpenseType {
	INCOME = "INCOME",
	EXPENSE = "EXPENSE",
	TRANSFER = "TRANSFER",
	INVESTMENT = "INVESTMENT",
}

export const ExpenseData = {
	[ExpenseType.EXPENSE]: { name: "Expense", color: RED_COLOR },
	[ExpenseType.INCOME]: { name: "Income", color: GREEN_COLOR },
	[ExpenseType.TRANSFER]: { name: "Transfer", color: BLUE_COLOR },
	[ExpenseType.INVESTMENT]: { name: "Investment", color: YELLOW_COLOR },
};

export default ExpenseType;
