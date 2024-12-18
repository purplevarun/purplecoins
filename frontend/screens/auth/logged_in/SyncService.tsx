import { useState } from "react";
import { GREEN_COLOR, RED_COLOR } from "../../../config/colors.config";
import { API_URL } from "../../../config/constants.config";
import { useSQLiteContext } from "expo-sqlite";
import axios from "axios";
import useAuthService from "../AuthService";

const upload_queries = {
	transaction: `SELECT * FROM transaction_record WHERE userId=?`,
	category: `SELECT * FROM category WHERE userId=?`,
	source: `SELECT * FROM source WHERE userId=?`,
	trip: `SELECT * FROM trip WHERE userId=?`,
	investment: `SELECT * FROM investment WHERE userId=?`,
	transaction_trip: `SELECT * FROM transaction_trip WHERE userId=?`,
	transaction_category: `SELECT * FROM transaction_category WHERE userId=?`,
};

const delete_queries = [
	`DELETE FROM transaction_record WHERE userId=?`,
	`DELETE FROM category WHERE userId=?`,
	`DELETE FROM source WHERE userId=?`,
	`DELETE FROM trip WHERE userId=?`,
	`DELETE FROM investment WHERE userId=?`,
	`DELETE FROM transaction_trip WHERE userId=?`,
	`DELETE FROM transaction_category WHERE userId=?`,
];

const download_queries = {
	transaction: `INSERT INTO transaction_record(id,userId,sourceId,amount,reason,date,type,destinationId,investmentId) VALUES(?,?,?,?,?,?,?,?,?)`,
	category: `INSERT INTO category(id,userId,name,type,monthlyBudget,annualBudget) VALUES(?,?,?,?,?,?)`,
	trip: `INSERT INTO trip(id,userId,name,startDate,endDate) VALUES(?,?,?,?,?)`,
	source: `INSERT INTO source(id,userId,name,initialAmount,currentAmount) VALUES(?,?,?,?,?)`,
	investment: `INSERT INTO investment(id,userId,name,investedAmount,currentAmount) VALUES(?,?,?,?,?)`,
	transaction_trip: `INSERT INTO transaction_trip(userId,transactionId,tripId) VALUES(?,?,?)`,
	transaction_category: `INSERT INTO transaction_category(userId,transactionId,categoryId) VALUES(?,?,?)`,
};

const useSyncService = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();

	const [msg, setMsg] = useState({ text: "", color: "" });

	const uploadData = async () => {
		try {
			const transactions = db.getAllSync(upload_queries.transaction, [
				userId,
			]);
			const categories = db.getAllSync(upload_queries.category, [userId]);
			const trips = db.getAllSync(upload_queries.trip, [userId]);
			const sources = db.getAllSync(upload_queries.source, [userId]);
			const investments = db.getAllSync(upload_queries.investment, [
				userId,
			]);
			const transaction_trips = db.getAllSync(
				upload_queries.transaction_trip,
				[userId],
			);
			const transaction_categories = db.getAllSync(
				upload_queries.transaction_category,
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
		} catch {
			setMsg({ text: "Upload Error", color: RED_COLOR });
		}
	};

	const downloadData = async () => {
		try {
			const url = `${API_URL}/download-data?userId=${userId}`;
			const {
				data: { data },
			} = await axios.get(url);
			const {
				Transaction,
				Category,
				Trip,
				Source,
				Investment,
				TransactionTrip,
				TransactionCategory,
			} = data;

			delete_queries.forEach((query) => {
				db.runSync(query, [userId]);
			});

			Transaction.forEach((transaction: any) => {
				db.runSync(download_queries.transaction, [
					transaction.id,
					transaction.userId,
					transaction.sourceId,
					transaction.amount,
					transaction.reason,
					transaction.date,
					transaction.type,
					transaction.destinationId,
					transaction.investmentId,
				]);
			});
			Category.forEach((category: any) => {
				db.runSync(download_queries.category, [
					category.id,
					category.userId,
					category.name,
					category.type,
					category.monthlyBudget,
					category.annualBudget,
				]);
			});
			Trip.forEach((trip: any) => {
				db.runSync(download_queries.trip, [
					trip.id,
					trip.userId,
					trip.name,
					trip.startDate,
					trip.endDate,
				]);
			});
			Source.forEach((source: any) => {
				db.runSync(download_queries.source, [
					source.id,
					source.userId,
					source.name,
					source.initialAmount,
					source.currentAmount,
				]);
			});
			Investment.forEach((investment: any) => {
				db.runSync(download_queries.investment, [
					investment.id,
					investment.userId,
					investment.name,
					investment.investedAmount,
					investment.currentAmount,
				]);
			});
			TransactionCategory.forEach((transactionCategory: any) => {
				db.runSync(download_queries.transaction_category, [
					transactionCategory.userId,
					transactionCategory.transactionId,
					transactionCategory.categoryId,
				]);
			});
			TransactionTrip.forEach((transactionTrip: any) => {
				db.runSync(download_queries.transaction_trip, [
					transactionTrip.userId,
					transactionTrip.transactionId,
					transactionTrip.tripId,
				]);
			});
			setMsg({ text: "Download Successful", color: GREEN_COLOR });
		} catch {
			setMsg({ text: "Download Error", color: RED_COLOR });
		}
	};

	return {
		uploadData,
		downloadData,
		msg,
	};
};

export default useSyncService;
