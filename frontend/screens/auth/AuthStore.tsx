import { create } from "zustand";

interface AuthStore {
	refreshValue: boolean;
	refresh: () => void;
}

const useAuthStore = create<AuthStore>(set => ({
	refreshValue: true,
	refresh: () => set((state) => ({ refreshValue: !state.refreshValue }))
}));


export default useAuthStore;