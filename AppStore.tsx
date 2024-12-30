import { create } from "zustand";

interface AppStore {
	isReRendering: boolean;
	triggerReRender: () => void;
	onEdit: () => void;
	setOnEdit: (onEdit: () => void) => void;
	onDelete: () => void;
	setOnDelete: (onDelete: () => void) => void;
}

const useAppStore = create<AppStore>((set) => ({
	isReRendering: true,
	triggerReRender: () =>
		set((state) => ({ isReRendering: !state.isReRendering })),
	onEdit: () => {},
	setOnEdit: (onEdit) => set({ onEdit }),
	onDelete: () => {},
	setOnDelete: (onDelete) => set({ onDelete }),
}));

export default useAppStore;
