import mongoose from "mongoose";

const transactionTripSchema = new mongoose.Schema({
	transactionId: { type: String, required: true },
	tripId: { type: String, required: true },
	userId: { type: String, required: true },
});

const TransactionTrip = mongoose.model(
	"Transaction Trip",
	transactionTripSchema,
);

export default TransactionTrip;
