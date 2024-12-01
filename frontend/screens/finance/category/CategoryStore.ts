import ExpenseType from "../../../types/ExpenseType";
import { create } from "zustand";

interface CategoryStore {
	categoryName: string;
	setCategoryName: (value: string) => void;
	categoryType: ExpenseType;
	setCategoryType: (value: ExpenseType) => void;
}

const useCategoryStore = create<CategoryStore>(set => ({
	categoryName: "",
	setCategoryName: (categoryName) => set({ categoryName }),
	categoryType: ExpenseType.EXPENSE,
	setCategoryType: (categoryType) => set({ categoryType })
}));


export default useCategoryStore;