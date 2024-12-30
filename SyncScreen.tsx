import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { BLUE_COLOR, GREEN_COLOR, RED_COLOR } from "./colors.config";
import { API_URL, CENTER, DB_NAME, FONT_SIZE } from "./constants.config";
import { select_all_users, sync_queries } from "./queries.config";
import ScreenLayout from "./ScreenLayout";
import CustomButton from "./CustomButton";
import CustomText from "./CustomText";
import Vertical from "./Vertical";
import IUser from "./IUser";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const SyncScreen = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;

	const [msg, setMsg] = useState({ text: "", color: "" });

	const uploadData = async () => {
		try {
			const data = Object.fromEntries(
				Object.entries(sync_queries.upload).map(([key, query]) => [
					key,
					db.getAllSync(query, [userId]),
				]),
			);
			const url = `${API_URL}/upload-data`;
			const response = await axios.post(url, { userId, ...data });
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

			sync_queries.delete.forEach((query) => {
				db.runSync(query, [userId]);
			});

			Transaction.forEach((transaction: any) => {
				db.runSync(sync_queries.download.transaction, [
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
				db.runSync(sync_queries.download.category, [
					category.id,
					category.userId,
					category.name,
					category.type,
					category.monthlyBudget,
					category.annualBudget,
				]);
			});
			Trip.forEach((trip: any) => {
				db.runSync(sync_queries.download.trip, [
					trip.id,
					trip.userId,
					trip.name,
					trip.startDate,
					trip.endDate,
				]);
			});
			Source.forEach((source: any) => {
				db.runSync(sync_queries.download.source, [
					source.id,
					source.userId,
					source.name,
					source.initialAmount,
					source.currentAmount,
				]);
			});
			Investment.forEach((investment: any) => {
				db.runSync(sync_queries.download.investment, [
					investment.id,
					investment.userId,
					investment.name,
					investment.investedAmount,
					investment.currentAmount,
				]);
			});
			TransactionCategory.forEach((transactionCategory: any) => {
				db.runSync(sync_queries.download.transaction_category, [
					transactionCategory.userId,
					transactionCategory.transactionId,
					transactionCategory.categoryId,
				]);
			});
			TransactionTrip.forEach((transactionTrip: any) => {
				db.runSync(sync_queries.download.transaction_trip, [
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

	const handleExport = async () => {
		const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
		await Sharing.shareAsync(dbPath);
	};

	return (
		<ScreenLayout>
			<Vertical size={FONT_SIZE * 2} />
			{msg.text.length > 0 && (
				<CustomText
					text={msg.text}
					color={msg.color}
					alignSelf={CENTER}
				/>
			)}
			<CustomButton text={"Export Data"} onPress={handleExport} />
			<Vertical size={FONT_SIZE / 2} />
			<CustomButton
				text={"Upload Data"}
				color={GREEN_COLOR}
				onPress={uploadData}
			/>
			<Vertical size={FONT_SIZE / 2} />
			<CustomButton
				text={"Download Data"}
				color={BLUE_COLOR}
				onPress={downloadData}
			/>
		</ScreenLayout>
	);
};

export default SyncScreen;
