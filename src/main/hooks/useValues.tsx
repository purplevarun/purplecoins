import { create } from "zustand";
import TransactionAction from "../constants/enums/TransactionAction";
import TransactionType from "../constants/enums/TransactionType";
import { convertDateToString } from "../util/HelperFunctions";

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
	sourceName: string;
	categoryName: string;
	investmentName: string;
	tripName: string;
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
	setSourceName: (sourceName: string) => void;
	setCategoryName: (categoryName: string) => void;
	setInvestmentName: (investmentName: string) => void;
	setTripName: (tripName: string) => void;
	setDate: (date: string) => void;
	clear: () => void;
}

const useValues = create<Values>((set) => ({
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
	sourceName: "",
	categoryName: "",
	investmentName: "",
	tripName: "",
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
	setSourceName: (sourceName) => set({ sourceName }),
	setCategoryName: (categoryName) => set({ categoryName }),
	setInvestmentName: (investmentName) => set({ investmentName }),
	setTripName: (tripName) => set({ tripName }),
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
			sourceName: "",
			categoryName: "",
			investmentName: "",
			tripName: "",
			date: state.date,
		})),
}));

export default useValues;
