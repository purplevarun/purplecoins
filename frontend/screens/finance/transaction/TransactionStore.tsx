import { create } from "zustand";
import TransactionType from "../../../components/TransactionType";

interface TransactionStore {
	type: TransactionType;
	setType: (type: TransactionType) => void;
	amount: string;
	setAmount: (amount: string) => void;
	reason: string;
	setReason: (reason: string) => void;
	sourceId: string;
	setSourceId: (source: string) => void;
	destinationId: string;
	setDestinationId: (destination: string) => void;
	investmentId: string;
	setInvestmentId: (investment: string) => void;
	categoryIds: string[];
	setCategoryIds: (categories: string[]) => void;
	tripIds: string[];
	setTripIds: (trips: string[]) => void;
	date: Date;
	setDate: (newDate: Date) => void;
	currentTransactionId: string;
	setCurrentTransactionId: (id: string) => void;
}

const useTransactionStore = create<TransactionStore>((set) => ({
	type: TransactionType.EXPENSE,
	setType: (type) => set({ type }),
	amount: "",
	setAmount: (amount) => set({ amount }),
	reason: "",
	setReason: (reason) => set({ reason }),
	sourceId: "",
	setSourceId: (sourceId) => set({ sourceId }),
	destinationId: "",
	setDestinationId: (destinationId) => set({ destinationId }),
	investmentId: "",
	setInvestmentId: (investmentId) => set({ investmentId }),
	categoryIds: [],
	setCategoryIds: (categoryIds) => set({ categoryIds }),
	tripIds: [],
	setTripIds: (tripIds) => set({ tripIds }),
	date: new Date(),
	setDate: (date) => set({ date }),
	currentTransactionId: "",
	setCurrentTransactionId: (currentTransactionId) =>
		set({ currentTransactionId }),
}));

export default useTransactionStore;
