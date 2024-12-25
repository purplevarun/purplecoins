import { create } from "zustand";

interface AppStore {
	isReRendering: boolean;
	triggerReRender: () => void;
}

const useAppStore = create<AppStore>((set) => ({
	isReRendering: true,
	triggerReRender: () =>
		set((state) => ({ isReRendering: !state.isReRendering })),
}));

export default useAppStore;
