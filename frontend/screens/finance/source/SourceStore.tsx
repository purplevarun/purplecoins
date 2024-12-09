import { create } from "zustand";

interface SourceStore {
	name: string;
	initialAmount: string;
	setName: (name: string) => void;
	setInitialAmount: (initialAmount: string) => void;
}

const useSourceStore = create<SourceStore>(
	set => ({
		name: "",
		initialAmount: "",
		setName: (name: string) => set({ name }),
		setInitialAmount: (initialAmount: string) => set({ initialAmount })
	})
);

export default useSourceStore;