import { API_URL } from "./constants.config";
import axios from "axios";

export const verifyUser = async (username: string, password: string) => {
	const url = `${API_URL}/verify-user?name=${username}&password=${password}`;
	const { data } = await axios.get(url);
	return {
		status: data.status,
		userId: data.user_id,
	};
};

export const createNewUser = async (username: string, password: string) => {
	const url = `${API_URL}/create-user?name=${username}&password=${password}`;
	const { data } = await axios.post(url);
	return {
		status: data.status,
		userId: data.user_id,
	};
};

export const checkUser = async (username: string) => {
	const url = `${API_URL}/check-user?name=${username}`;
	const { data } = await axios.get(url);
	return { status: data.status };
};
