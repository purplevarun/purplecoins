import mongoose from "mongoose";

const transactionCategorySchema =
	new mongoose.Schema({
			transactionId: { type: String, required: true },
			categoryId: { type: String, required: true },
			userId: { type: String, required: true }
		}
	);

const TransactionCategory = mongoose.model("TransactionCategory", transactionCategorySchema);

export default TransactionCategory;