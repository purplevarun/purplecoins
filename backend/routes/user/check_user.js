import express from "express";
import UserModel from "./../../models/UserModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const { name } = req.query;
		const user = await UserModel.findOne({ name }).exec();
		if (!user) {
			return res.json({ status: 404, message: "User not found" });
		}
		return res.json({ status: 200, message: "User found" });
	} catch (error) {
		console.error("Error:", error);
		return res.json({ status: 500, message: "Internal server error" });
	}
});

export default router;
