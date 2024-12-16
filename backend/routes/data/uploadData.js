import express from "express";
import Source from "../../models/SourceModel.js";
import Investment from "../../models/InvestmentSchema.js";
import Transaction from "../../models/TransactionModel.js";
import Trip from "../../models/TripModel.js";
import Category from "../../models/CategoryModel.js";
import TransactionCategory from "../../models/TransactionCategoryModel.js";
import TransactionTrip from "../../models/TransactionTripModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const {
			transactions,
			categories,
			trips,
			sources,
			investments,
			transaction_trips,
			transaction_categories,
			userId
		} = req.body;

		const models = [
			{ model: Source, data: sources },
			{ model: Investment, data: investments },
			{ model: Transaction, data: transactions },
			{ model: Trip, data: trips },
			{ model: Category, data: categories },
			{ model: TransactionCategory, data: transaction_categories },
			{ model: TransactionTrip, data: transaction_trips }
		];

		Promise.all(models.map(async ({ model, data }) => {
			await model.deleteMany({ userId });
			await model.bulkSave(data.map(item => new model(item)));
		})).then(() => {
			return res.json({
				status: 201, message: "Data Uploaded Successfully"
			});
		}).catch(() => {
			return res.json({
				status: 500, message: "Unknown error"
			});
		});

	} catch (error) {
		console.error("Error:", error);
		return res.json({
			status: 500, message: "Internal server error"
		});
	}
});

export default router;
