import mongoose from "mongoose";

const categorySchema =
	new mongoose.Schema(
		{
			id: { type: String, required: true, unique: true },
			userId: { type: String, required: true },
			name: { type: String, required: true },
			type: { type: String, enum: ["EXPENSE", "INCOME"], required: true },
			monthlyBudget: { type: Number },
			annualBudget: { type: Number }
		}
	);

const Category = mongoose.model("Category", categorySchema);

export default Category;
