import { create } from "zustand";

interface CategoryStore {
	name: string;
	setName: (value: string) => void;
}

const useCategoryStore = create<CategoryStore>((set) => ({
	name: "",
	setName: (name) => set({ name }),
}));

export default useCategoryStore;
