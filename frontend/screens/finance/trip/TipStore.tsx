import { create } from "zustand";

interface TripStore {
	tripStartDate: Date;
	tripEndDate: Date;
	setTripStartDate: (date: Date) => void;
	setTripEndDate: (date: Date) => void;
	tripStartDateSet: boolean;
	tripEndDateSet: boolean;
	setTripStartDateSet: (show: boolean) => void;
	setTripEndDateSet: (show: boolean) => void;
}

const useTripStore = create<TripStore>(set => ({
	tripStartDate: new Date(),
	tripEndDate: new Date(),
	tripStartDateSet: false,
	tripEndDateSet: false,
	setTripStartDate: (tripStartDate) => set({ tripStartDate }),
	setTripEndDate: (tripEndDate) => set({ tripEndDate }),
	setTripStartDateSet: (tripStartDateSet) => set({ tripStartDateSet }),
	setTripEndDateSet: (tripEndDateSet) => set({ tripEndDateSet })
}));

export default useTripStore;