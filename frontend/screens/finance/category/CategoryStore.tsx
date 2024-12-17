import TransactionType from "../../../components/TransactionType";
import { create } from "zustand";

interface CategoryStore {
	name: string;
	setName: (value: string) => void;
	type: TransactionType;
	setType: (value: TransactionType) => void;
	currentId: string;
	setCurrentId: (value: string) => void;
}

const useCategoryStore = create<CategoryStore>((set) => ({
	name: "",
	setName: (name) => set({ name }),
	type: TransactionType.EXPENSE,
	setType: (type) => set({ type }),
	currentId: "",
	setCurrentId: (currentId) => set({ currentId }),
}));

export default useCategoryStore;
