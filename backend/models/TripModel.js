import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	name: { type: String, required: true },
	startDate: { type: Date },
	endDate: { type: Date },
});

const Trip = mongoose.model("Trip", TripSchema);

export default Trip;
