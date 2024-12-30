import uuid from "react-native-uuid";

export const generateUUID = () => uuid.v4().toString();

export const objectify = (data: any) => {
	return JSON.stringify(data, null, 4);
};

export const logger = (data: any) => {
	console.log(objectify(data));
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

export const formatMoney = (money: number | null) => {
	if (money === null) return "null";
	return "₹" + money.toLocaleString("en-IN");
};

export const toInt = (str: string) => {
	if (str.length === 0) return 0;
	return parseInt(str);
};
