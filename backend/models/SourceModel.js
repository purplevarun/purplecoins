import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	name: { type: String, required: true },
	initialAmount: { type: Number, required: true },
	currentAmount: { type: Number, required: true },
});

const Source = mongoose.model("Source", sourceSchema);

export default Source;
