import { create } from "zustand";
import Action from "../constants/enums/Action";
import Type from "../constants/enums/Type";
import IGroupedTransaction from "../domains/transaction/IGroupedTransaction";
import { getCurrentDateString } from "../util/HelperFunctions";

interface Values {
	amount: string;
	reason: string;
	source: string;
	type: Type;
	action: Action;
	investment: string | null;
	destination: string | null;
	trips: string[];
	categories: string[];
	groupedTransactions: IGroupedTransaction[];
	sourceName: string;
	categoryName: string;
	investmentName: string;
	tripName: string;
	date: string;
	setAmount: (amount: string) => void;
	setReason: (reason: string) => void;
	setSource: (source: string) => void;
	setType: (type: Type) => void;
	setAction: (action: Action) => void;
	setInvestment: (investment: string | null) => void;
	setDestination: (destination: string | null) => void;
	setTrips: (trips: string[]) => void;
	setCategories: (categories: string[]) => void;
	setGroupedTransactions: (transactions: IGroupedTransaction[]) => void;
	setSourceName: (sourceName: string) => void;
	setCategoryName: (categoryName: string) => void;
	setInvestmentName: (investmentName: string) => void;
	setTripName: (tripName: string) => void;
	setDate: (date: string) => void;
}

const useValues = create<Values>((set) => ({
	amount: "",
	reason: "",
	source: "",
	type: Type.GENERAL,
	action: Action.DEBIT,
	investment: null,
	destination: null,
	trips: [],
	categories: [],
	groupedTransactions: [],
	sourceName: "",
	categoryName: "",
	investmentName: "",
	tripName: "",
	date: getCurrentDateString(),
	setAmount: (amount) => set({ amount }),
	setReason: (reason) => set({ reason }),
	setSource: (source) => set({ source }),
	setType: (type) => set({ type }),
	setAction: (action) => set({ action }),
	setInvestment: (investment) => set({ investment }),
	setDestination: (destination) => set({ destination }),
	setTrips: (trips) => set({ trips }),
	setCategories: (categories) => set({ categories }),
	setGroupedTransactions: (groupedTransactions) =>
		set({ groupedTransactions }),
	setSourceName: (sourceName) => set({ sourceName }),
	setCategoryName: (categoryName) => set({ categoryName }),
	setInvestmentName: (investmentName) => set({ investmentName }),
	setTripName: (tripName) => set({ tripName }),
	setDate: (date) => set({ date }),
}));

export default useValues;
