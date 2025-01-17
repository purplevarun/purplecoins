export const formatMoney = (money: number | null | undefined) => {
	if (money === null || money === undefined) return "null";
	return "₹" + money.toLocaleString("en-IN");
};
