import { create } from "zustand";

interface TransactionStore {
	showAddTransactionModal: boolean;
	toggleAddTransactionModal: () => void;
}

const useTransaction = create<TransactionStore>((set) => ({
	showAddTransactionModal: false,
	toggleAddTransactionModal: () =>
		set((state) => ({
			showAddTransactionModal: !state.showAddTransactionModal,
		})),
}));

export default useTransaction;
