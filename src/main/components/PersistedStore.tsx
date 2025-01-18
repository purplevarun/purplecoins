import { create } from "zustand";

const todayDate = () => {
	const date = new Date();
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year % 100}`;
};

interface TransactionStore {
	date: string;
	setDate: (newDate: string) => void;
}

const usePersistedStore = create<TransactionStore>((set) => ({
	date: todayDate(),
	setDate: (date) => set({ date }),
}));

export default usePersistedStore;
