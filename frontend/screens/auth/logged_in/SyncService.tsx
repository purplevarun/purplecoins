import { API_URL } from "../../../config/constants.config";
import axios from "axios";
import { useSQLiteContext } from "expo-sqlite";
import useAuthService from "../AuthService";
import { useState } from "react";
import { GREEN_COLOR, RED_COLOR } from "../../../config/colors.config";

const useSync = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();

	const [msg, setMsg] = useState({ text: "", color: "" });

	const uploadData = async () => {
		const transactions = db.getAllSync(`SELECT * FROM transaction_record WHERE userId=?`, [userId]);
		const categories = db.getAllSync(`SELECT * FROM category WHERE userId=?`, [userId]);
		const trips = db.getAllSync(`SELECT * FROM trip WHERE userId=?`, [userId]);
		const sources = db.getAllSync(`SELECT * FROM source WHERE userId=?`, [userId]);
		const investments = db.getAllSync(`SELECT * FROM investment WHERE userId=?`, [userId]);
		const transaction_trips = db.getAllSync(`SELECT * FROM transaction_trip WHERE userId=?`, [userId]);
		const transaction_categories = db.getAllSync(`SELECT * FROM transaction_category WHERE userId=?`, [userId]);

		const data = {
			transactions,
			categories,
			trips,
			sources,
			investments,
			transaction_trips,
			transaction_categories,
			userId
		};
		const url = `${API_URL}/upload-data`;
		const response = await axios.post(url, data);
		if (response.data.status === 201) {
			setMsg({ text: "Upload Successful", color: GREEN_COLOR });
		} else {
			setMsg({ text: "Upload Error", color: RED_COLOR });
		}
	};

	const downloadData = async () => {
		const url = `${API_URL}/download-data?userId=${userId}`;
		await axios.get(url);
	};

	return {
		uploadData,
		downloadData,
		msg
	};
};

export default useSync;