import { create } from "zustand";

interface SourceStore {
	name: string;
	initialAmount: string;
	setName: (name: string) => void;
	setInitialAmount: (initialAmount: string) => void;
	redirect: boolean;
	setRedirect: (redirect: boolean) => void;
}

const useSourceStore = create<SourceStore>(
	set => ({
		name: "",
		initialAmount: "",
		setName: (name: string) => set({ name }),
		setInitialAmount: (initialAmount: string) => set({ initialAmount }),
		redirect: false,
		setRedirect: (redirect: boolean) => set({ redirect })
	})
);

export default useSourceStore;