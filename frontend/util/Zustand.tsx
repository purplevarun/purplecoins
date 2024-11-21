import { create } from "zustand";
import ExpenseType from "../types/ExpenseType";

type stringSetter = (value: string) => void;
type expenseTypeSetter = (value: ExpenseType) => void;
type voidFunction = () => void;

interface IStore {
	// global
	refreshValue: boolean;
	refresh: voidFunction;
	// category
	categoryName: string;
	setCategoryName: stringSetter;
	categoryType: ExpenseType;
	setCategoryType: expenseTypeSetter;
	// transaction
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
	// trip
	tripStartDate: Date;
	tripEndDate: Date;
	setTripStartDate: (date: Date) => void;
	setTripEndDate: (date: Date) => void;
	tripStartDateSet: boolean;
	tripEndDateSet: boolean;
	setTripStartDateSet: (show: boolean) => void;
	setTripEndDateSet: (show: boolean) => void;
}

const useStore = create<IStore>(set => ({
	// global
	refreshValue: true,
	refresh: () => set((state) => ({ refreshValue: !state.refreshValue })),
	// category
	categoryName: "",
	setCategoryName: (categoryName) => set({ categoryName }),
	categoryType: ExpenseType.EXPENSE,
	setCategoryType: (categoryType) => set({ categoryType }),
	// transaction
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
	setTransactionDate: (transactionDate) => set({ transactionDate }),
	// trip
	tripStartDate: new Date(),
	tripEndDate: new Date(),
	tripStartDateSet: false,
	tripEndDateSet: false,
	setTripStartDate: (tripStartDate) => set({ tripStartDate }),
	setTripEndDate: (tripEndDate) => set({ tripEndDate }),
	setTripStartDateSet: (tripStartDateSet) => set({ tripStartDateSet }),
	setTripEndDateSet: (tripEndDateSet) => set({ tripEndDateSet })
}));

export default useStore;