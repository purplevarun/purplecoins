import express from "express";
import Source from "../../models/SourceModel.js";
import Investment from "../../models/InvestmentSchema.js";
import Transaction from "../../models/TransactionModel.js";
import Trip from "../../models/TripModel.js";
import Category from "../../models/CategoryModel.js";
import TransactionCategory from "../../models/TransactionCategoryModel.js";
import TransactionTrip from "../../models/TransactionTripModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const { userId } = req.query;
		const models = [
			Source,
			Investment,
			Transaction,
			Trip,
			Category,
			TransactionCategory,
			TransactionTrip,
		];
		const data = {};
		for (const model of models) {
			data[model.modelName] = await model
				.find({ userId }, {}, null)
				.exec();
		}
		return res.json({
			status: 200,
			data,
		});
	} catch (error) {
		return res.json({
			status: 500,
			message: "Internal server error",
		});
	}
});

export default router;
