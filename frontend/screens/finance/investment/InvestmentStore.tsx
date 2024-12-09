import { create } from "zustand";

interface InvestmentStore {
	name: string;
	setName: (name: string) => void;
	investedAmount: string;
	setInvestedAmount: (initialAmount: string) => void;
	currentAmount: string;
	setCurrentAmount: (currentAmount: string) => void;
}

const useInvestmentStore = create<InvestmentStore>(
	set => ({
		name: "",
		setName: (name: string) => set({ name }),
		investedAmount: "",
		setInvestedAmount: (investedAmount: string) => set({ investedAmount }),
		currentAmount: "",
		setCurrentAmount: (currentAmount: string) => set({ currentAmount })
	})
);

export default useInvestmentStore;