import { create } from "zustand";
import TransactionAction from "./TransactionAction";
import TransactionType from "./TransactionType";
import { convertDateToString } from "./HelperFunctions";

interface Values {
	amount: string;
	reason: string;
	source: string;
	type: TransactionType;
	action: TransactionAction;
	investment: string | null;
	destination: string | null;
	trips: string[];
	categories: string[];
	date: string;
	setAmount: (amount: string) => void;
	setReason: (reason: string) => void;
	setSource: (source: string) => void;
	setType: (type: TransactionType) => void;
	setAction: (action: TransactionAction) => void;
	setInvestment: (investment: string | null) => void;
	setDestination: (destination: string | null) => void;
	setTrips: (trips: string[]) => void;
	setCategories: (categories: string[]) => void;
	setDate: (date: string) => void;
	clear: () => void;
	trigger: boolean;
	changeTrigger: () => void;
}

const useValues = create<Values>((set) => ({
	trigger: false,
	changeTrigger: () => set((state) => ({ trigger: !state.trigger })),
	amount: "",
	reason: "",
	source: "",
	type: TransactionType.GENERAL,
	action: TransactionAction.DEBIT,
	investment: null,
	destination: null,
	trips: [],
	categories: [],
	groupedTransactions: [],
	date: convertDateToString(),
	setAmount: (amount) => set({ amount }),
	setReason: (reason) => set({ reason }),
	setSource: (source) => set({ source }),
	setType: (type) => set({ type }),
	setAction: (action) => set({ action }),
	setInvestment: (investment) => set({ investment }),
	setDestination: (destination) => set({ destination }),
	setTrips: (trips) => set({ trips }),
	setCategories: (categories) => set({ categories }),
	setDate: (date) => set({ date }),
	clear: () =>
		set((state) => ({
			amount: "",
			reason: "",
			source: "",
			type: TransactionType.GENERAL,
			action: TransactionAction.DEBIT,
			investment: null,
			destination: null,
			trips: [],
			categories: [],
			date: state.date,
		})),
}));

export default useValues;
