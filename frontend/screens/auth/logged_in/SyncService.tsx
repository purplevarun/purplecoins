import { API_URL } from "../../../config/constants.config";
import axios from "axios";
import { useSQLiteContext } from "expo-sqlite";
import useAuthService from "../AuthService";
import { useState } from "react";
import { GREEN_COLOR, RED_COLOR } from "../../../config/colors.config";
import { objectify } from "../../../util/helpers/HelperFunctions";

const useSync = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();

	const [msg, setMsg] = useState({ text: "", color: "" });

	const uploadData = async () => {
		const transactions = db.getAllSync(
			`SELECT * FROM transaction_record WHERE userId=?`,
			[userId],
		);
		const categories = db.getAllSync(
			`SELECT * FROM category WHERE userId=?`,
			[userId],
		);
		const trips = db.getAllSync(`SELECT * FROM trip WHERE userId=?`, [
			userId,
		]);
		const sources = db.getAllSync(`SELECT * FROM source WHERE userId=?`, [
			userId,
		]);
		const investments = db.getAllSync(
			`SELECT * FROM investment WHERE userId=?`,
			[userId],
		);
		const transaction_trips = db.getAllSync(
			`SELECT * FROM transaction_trip WHERE userId=?`,
			[userId],
		);
		const transaction_categories = db.getAllSync(
			`SELECT * FROM transaction_category WHERE userId=?`,
			[userId],
		);

		const data = {
			transactions,
			categories,
			trips,
			sources,
			investments,
			transaction_trips,
			transaction_categories,
			userId,
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
		const {
			data: { data },
		} = await axios.get(url);
		// console.log(objectify(data));
		const {
			Transaction,
			Category,
			Trip,
			Source,
			Investment,
			TransactionTrip,
			TransactionCategory,
		} = data;
		db.runSync(`DELETE FROM transaction_record WHERE userId=?`, [userId]);
		db.runSync(`DELETE FROM category WHERE userId=?`, [userId]);
		db.runSync(`DELETE FROM trip WHERE userId=?`, [userId]);
		db.runSync(`DELETE FROM source WHERE userId=?`, [userId]);
		db.runSync(`DELETE FROM investment WHERE userId=?`, [userId]);
		db.runSync(`DELETE FROM transaction_trip WHERE userId=?`, [userId]);
		db.runSync(`DELETE FROM transaction_category WHERE userId=?`, [userId]);
		Transaction.forEach((transaction: any) => {
			db.runSync(
				`INSERT INTO transaction_record(id,userId,sourceId,amount,reason,date,type,destinationId,investmentId) VALUES(?,?,?,?,?,?,?,?,?)`,
				[
					transaction.id,
					transaction.userId,
					transaction.sourceId,
					transaction.amount,
					transaction.reason,
					transaction.date,
					transaction.type,
					transaction.destinationId,
					transaction.investmentId,
				],
			);
		});
		Category.forEach((category: any) => {
			db.runSync(
				`INSERT INTO category(id,userId,name,type,monthlyBudget,annualBudget) VALUES(?,?,?,?,?,?)`,
				[
					category.id,
					category.userId,
					category.name,
					category.type,
					category.monthlyBudget,
					category.annualBudget,
				],
			);
		});
		Trip.forEach((trip: any) => {
			db.runSync(
				`INSERT INTO trip(id,userId,name,startDate,endDate) VALUES(?,?,?,?,?)`,
				[trip.id, trip.userId, trip.name, trip.startDate, trip.endDate],
			);
		});
		Source.forEach((source: any) => {
			db.runSync(
				`INSERT INTO source(id,userId,name,initialAmount,currentAmount) VALUES(?,?,?,?,?)`,
				[
					source.id,
					source.userId,
					source.name,
					source.initialAmount,
					source.currentAmount,
				],
			);
		});
		Investment.forEach((investment: any) => {
			db.runSync(
				`INSERT INTO investment(id,userId,name,investedAmount,currentAmount) VALUES(?,?,?,?,?)`,
				[
					investment.id,
					investment.userId,
					investment.name,
					investment.investedAmount,
					investment.currentAmount,
				],
			);
		});
		TransactionCategory.forEach((transactionCategory: any) => {
			db.runSync(
				`INSERT INTO transaction_category(userId,transactionId,categoryId) VALUES(?,?,?)`,
				[
					transactionCategory.userId,
					transactionCategory.transactionId,
					transactionCategory.categoryId,
				],
			);
		});
		TransactionTrip.forEach((transactionTrip: any) => {
			db.runSync(
				`INSERT INTO transaction_trip(userId,transactionId,tripId) VALUES(?,?,?)`,
				[
					transactionTrip.userId,
					transactionTrip.transactionId,
					transactionTrip.tripId,
				],
			);
		});
		console.log(objectify(data));
	};

	return {
		uploadData,
		downloadData,
		msg,
	};
};

export default useSync;
