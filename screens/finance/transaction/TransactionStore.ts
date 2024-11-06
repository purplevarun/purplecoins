import { create } from "zustand";
import ExpenseType from "../../../types/ExpenseType";

interface TransactionState {
	type: ExpenseType;
	amount: string;
	reason: string;
	source: string;
	destination: string;
	investment: string;
	categories: string[];
	trips: string[];

	setType: (type: ExpenseType) => void;
	setAmount: (amount: string) => void;
	setReason: (reason: string) => void;
	setSource: (source: string) => void;
	setDestination: (destination: string) => void;
	setInvestment: (investment: string) => void;
	setCategories: (categories: string[]) => void;
	setTrips: (trips: string[]) => void;
}

const useTransactionStore = create<TransactionState>((set) => ({
	type: ExpenseType.EXPENSE,
	amount: "",
	reason: "",
	source: "",
	destination: "",
	investment: "",
	categories: [],
	trips: [],

	setType: (type) => set({ type }),
	setAmount: (amount) => set({ amount }),
	setReason: (reason) => set({ reason }),
	setSource: (source) => set({ source }),
	setDestination: (destination) => set({ destination }),
	setInvestment: (investment) => set({ investment }),
	setCategories: (categories) => set({ categories }),
	setTrips: (trips) => set({ trips }),
}));

export default useTransactionStore;
