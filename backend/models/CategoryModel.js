import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
	// id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	type: {
		type: String,
		required: true,
		enum: ["EXPENSE", "INCOME", "TRANSFER"],
	},
});

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
