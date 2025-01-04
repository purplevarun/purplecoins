import { randomUUID } from "expo-crypto";

export const generateUUID = () => randomUUID();

export const objectify = (data: any) => {
	return JSON.stringify(data, null, 4);
};

export const logger = (arg1: any, arg2?: any) => {
	if (arg2) {
		console.log(arg1, objectify(arg2));
	} else {
		console.log(objectify(arg1));
	}
};

export const formatDate = (date: Date | null | undefined, full = false) => {
	if (date === null || date === undefined) return "Not specified";
	date = new Date(date);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	if (!full) return `${day}/${month}/${year % 100}`;
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const suffix =
		day === "01" ? "st" : day === "02" ? "nd" : day === "03" ? "rd" : "th";
	return `${day}${suffix} ${months[parseInt(month) - 1]} ${year}`;
};

export const formatMoney = (money: number | null | undefined) => {
	if (money === null || money === undefined) return "null";
	return "₹" + money.toLocaleString("en-IN");
};

export const toInt = (str: string) => {
	if (str.length === 0) return 0;
	return parseInt(str);
};
