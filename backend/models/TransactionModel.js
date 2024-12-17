import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	sourceId: { type: String, required: true },
	amount: { type: Number, required: true },
	reason: { type: String, required: true },
	date: { type: Date, required: true },
	type: {
		type: String,
		enum: ["EXPENSE", "INCOME", "TRANSFER", "INVESTMENT"],
		required: true,
	},
	destinationId: { type: String },
	investmentId: { type: String },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
