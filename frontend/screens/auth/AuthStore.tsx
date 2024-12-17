import { create } from "zustand";

interface AuthStore {
	refresh: boolean;
	toggleRefresh: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
	refresh: true,
	toggleRefresh: () => set((state) => ({ refresh: !state.refresh })),
}));

export default useAuthStore;
