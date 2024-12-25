import { create } from "zustand";

interface CategoryStore {
	name: string;
	setName: (value: string) => void;
	currentId: string;
	setCurrentId: (value: string) => void;
}

const useCategoryStore = create<CategoryStore>((set) => ({
	name: "",
	setName: (name) => set({ name }),
	currentId: "",
	setCurrentId: (currentId) => set({ currentId }),
}));

export default useCategoryStore;
