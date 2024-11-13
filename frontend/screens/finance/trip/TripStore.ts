import { create } from "zustand";

interface TripStore {
	startDate: Date;
	endDate: Date;
	setStartDate: (date: Date) => void;
	setEndDate: (date: Date) => void;
	startDateSet: boolean;
	endDateSet: boolean;
	setStartDateSet: (show: boolean) => void;
	setEndDateSet: (show: boolean) => void;
}

const useTripStore = create<TripStore>((set) => ({
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
