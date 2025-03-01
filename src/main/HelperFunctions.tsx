export const formatMoney = (money: number | null | undefined) => {
	if (money === null || money === undefined) return "null";
	return "₹" + money.toLocaleString("en-IN");
};

export const convertDateToString = (incomingDate: Date = new Date()) => {
	const newDate = new Date(incomingDate);
	const day = String(newDate.getDate()).padStart(2, "0");
	const month = String(newDate.getMonth() + 1).padStart(2, "0");
	const year = newDate.getFullYear();
	return `${day}/${month}/${year}`;
};

export const convertStringToDate = (incomingDate: string) => {
	const [d, m, y] = incomingDate.split("/");
	const newDate = new Date();
	newDate.setFullYear(parseInt(y), parseInt(m) - 1, parseInt(d));
	newDate.setHours(0, 0, 0, 0);
	return newDate;
};
