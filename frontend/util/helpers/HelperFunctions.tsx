import uuid from "react-native-uuid";

export const generateUUID = () => uuid.v4().toString();

export const objectify = (data: any) => {
	return JSON.stringify(data, null, 2);
};

export const formatDate = (date: Date | null | undefined) => {
	if (date === null || date === undefined) return "null";
	date = new Date(date);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};

export const formatMoney = (money: number | null) => {
	if (money === null) return "null";
	return "₹" + money.toLocaleString("en-IN");
};

export const logger = (label: string, data?: any) => {
	if (data === undefined) {
		return console.log(label);
	} else {
		console.log(label + " : " + JSON.stringify(data, null, 2));
	}
};

export const toInt = (str: string) => {
	if (str.length === 0)
		return 0;
	return parseInt(str);
};