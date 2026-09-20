import type SelectOption from "@/types/SelectOption";

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;
const DEFAULT_FY_START_MONTH = 4;
const MONTH_OPTIONS: readonly SelectOption[] = [
	{ label: "Jan", value: "1" },
	{ label: "Feb", value: "2" },
	{ label: "Mar", value: "3" },
	{ label: "Apr", value: "4" },
	{ label: "May", value: "5" },
	{ label: "Jun", value: "6" },
	{ label: "Jul", value: "7" },
	{ label: "Aug", value: "8" },
	{ label: "Sep", value: "9" },
	{ label: "Oct", value: "10" },
	{ label: "Nov", value: "11" },
	{ label: "Dec", value: "12" },
];

const dateConstants = {
	ALL_TIME_END,
	ALL_TIME_START,
	DEFAULT_FY_START_MONTH,
	MONTH_OPTIONS,
};

export default dateConstants;
