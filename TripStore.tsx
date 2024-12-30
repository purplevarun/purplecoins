import { create } from "zustand";

interface TripStore {
	name: string;
	setName: (value: string) => void;
	startDate: Date;
	setStartDate: (date: Date) => void;
	endDate: Date;
	setEndDate: (date: Date) => void;
	startDateSet: boolean;
	setStartDateSet: (show: boolean) => void;
	endDateSet: boolean;
	setEndDateSet: (show: boolean) => void;
}

const useTripStore = create<TripStore>((set) => ({
	name: "",
	setName: (name) => set({ name }),
	startDate: new Date(),
	endDate: new Date(),
	startDateSet: false,
	endDateSet: false,
	setStartDate: (startDate) => set({ startDate }),
	setEndDate: (endDate) => set({ endDate }),
	setStartDateSet: (startDateSet) => set({ startDateSet }),
	setEndDateSet: (endDateSet) => set({ endDateSet }),
}));

export default useTripStore;
