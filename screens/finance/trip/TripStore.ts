import { create } from "zustand";

interface TripStore {
	startDate: Date;
	endDate: Date;
	showStartDate: boolean;
	showEndDate: boolean;
	setStartDate: (date: Date) => void;
	setEndDate: (date: Date) => void;
	setShowStartDate: (show: boolean) => void;
	setShowEndDate: (show: boolean) => void;
	startDateSet: boolean;
	endDateSet: boolean;
	setStartDateSet: (show: boolean) => void;
	setEndDateSet: (show: boolean) => void;
}

const useTripStore = create<TripStore>((set) => ({
	startDate: new Date(),
	endDate: new Date(),
	showStartDate: false,
	showEndDate: false,
	startDateSet: false,
	endDateSet: false,
	setStartDate: (startDate) => set({ startDate }),
	setEndDate: (endDate) => set({ endDate }),
	setShowStartDate: (showStartDate) => set({ showStartDate }),
	setShowEndDate: (showEndDate) => set({ showEndDate }),
	setStartDateSet: (startDateSet) => set({ startDateSet }),
	setEndDateSet: (endDateSet) => set({ endDateSet }),
}));

export default useTripStore;
