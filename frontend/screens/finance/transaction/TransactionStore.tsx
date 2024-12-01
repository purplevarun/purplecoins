import { create } from "zustand";
import ExpenseType from "../../../types/ExpenseType";

interface TransactionStore {
	transactionType: ExpenseType;
	setTransactionType: (type: ExpenseType) => void;
	transactionAmount: string;
	setTransactionAmount: (amount: string) => void;
	transactionReason: string;
	setTransactionReason: (reason: string) => void;
	transactionSourceId: string;
	setTransactionSourceId: (source: string) => void;
	transactionDestinationId: string;
	setTransactionDestinationId: (destination: string) => void;
	transactionInvestmentId: string;
	setTransactionInvestmentId: (investment: string) => void;
	transactionCategoryIds: string[];
	setTransactionCategoryIds: (categories: string[]) => void;
	transactionTripIds: string[];
	setTransactionTripIds: (trips: string[]) => void;
	transactionDate: Date;
	setTransactionDate: (newDate: Date) => void;
}

const useTransactionStore = create<TransactionStore>(set => ({
	transactionType: ExpenseType.EXPENSE,
	setTransactionType: (transactionType) => set({ transactionType }),
	transactionAmount: "",
	setTransactionAmount: (transactionAmount) => set({ transactionAmount }),
	transactionReason: "",
	setTransactionReason: (transactionReason) => set({ transactionReason }),
	transactionSourceId: "",
	setTransactionSourceId: (transactionSourceId) => set({ transactionSourceId }),
	transactionDestinationId: "",
	setTransactionDestinationId: (transactionDestinationId) => set({ transactionDestinationId }),
	transactionInvestmentId: "",
	setTransactionInvestmentId: (transactionInvestmentId) => set({ transactionInvestmentId }),
	transactionCategoryIds: [],
	setTransactionCategoryIds: (transactionCategoryIds) => set({ transactionCategoryIds }),
	transactionTripIds: [],
	setTransactionTripIds: (transactionTripIds) => set({ transactionTripIds }),
	transactionDate: new Date(),
	setTransactionDate: (transactionDate) => set({ transactionDate })
}));

export default useTransactionStore;