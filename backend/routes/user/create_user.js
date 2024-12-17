import express from "express";
import UserModel from "./../../models/UserModel.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const { name, password } = req.query;
		if (!name || !password) {
			return res.json({
				status: 400,
				message: "Username or Password not provided",
			});
		}
		const existingUser = await UserModel.findOne({ name }, {}, null).exec();
		if (existingUser !== null) {
			return res.json({
				status: 400,
				message: "User exists",
			});
		} else {
			const hashedPassword = bcrypt.hashSync(password, 10);
			const user = new UserModel({ name, password: hashedPassword });
			await user.save();
			return res.json({
				status: 200,
				message: "Created new User",
				user_id: user._id,
				user_name: user.name,
			});
		}
	} catch (message) {
		return res.json({
			status: 500,
			message,
		});
	}
});

export default router;
