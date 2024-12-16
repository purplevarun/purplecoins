import mongoose from "mongoose";

const investmentSchema =
	new mongoose.Schema({
			id: { type: String, required: true, unique: true },
			userId: { type: String, required: true },
			name: { type: String, required: true },
			investedAmount: { type: Number, required: true },
			currentAmount: { type: Number, required: true }
		}
	);

const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;