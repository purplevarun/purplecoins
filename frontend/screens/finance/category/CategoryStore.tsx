import TransactionType from "../../../components/TransactionType";
import { create } from "zustand";

interface CategoryStore {
	categoryName: string;
	setCategoryName: (value: string) => void;
	categoryType: TransactionType;
	setCategoryType: (value: TransactionType) => void;
}

const useCategoryStore = create<CategoryStore>(set => ({
	categoryName: "",
	setCategoryName: (categoryName) => set({ categoryName }),
	categoryType: TransactionType.EXPENSE,
	setCategoryType: (categoryType) => set({ categoryType })
}));


export default useCategoryStore;