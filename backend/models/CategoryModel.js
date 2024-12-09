import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true,
		enum: ["EXPENSE", "INCOME"]
	}
});

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
