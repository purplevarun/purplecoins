import { create } from "zustand";

interface StoreTransaction {
	showAddTransactionModal: boolean;
	toggleAddTransactionModal: () => void;
}

const useTransaction = create<StoreTransaction>((set) => ({
	showAddTransactionModal: false,
	toggleAddTransactionModal: () =>
		set((state) => ({
			showAddTransactionModal: !state.showAddTransactionModal,
		})),
}));

export default useTransaction;
