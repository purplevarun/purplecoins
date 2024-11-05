import uuid from "react-native-uuid";

export const generateUUID = () => uuid.v4().toString();

export const objectify = (data: any) => JSON.stringify(data, null, 2);

export const formatDate = (date: Date | null | undefined) => {
	if (date === null || date === undefined) return "null";

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};
