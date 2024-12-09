import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: true
	},
	reason: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	categories: {
		type: [String],
		default: []
	},
	tripId: {
		type: String,
		default: null
	},
	labelId: {
		type: String,
		default: null
	}
});

const TransactionModel = mongoose.model("Transaction", transactionSchema);

export default TransactionModel;
