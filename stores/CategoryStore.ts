import { create } from "zustand";

interface CategoryState {
	categoryType: "EXPENSE" | "INCOME";
	toggleCategoryType: () => void;
}

const useCategory = create<CategoryState>((set) => ({
	categoryType: "EXPENSE",
	toggleCategoryType: () =>
		set((state) => ({
			categoryType:
				state.categoryType === "EXPENSE" ? "INCOME" : "EXPENSE",
		})),
}));

export default useCategory;
