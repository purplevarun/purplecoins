import express from "express";
import UserModel from "./../../models/UserModel.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const { name, password } = req.query;
		if (!name || !password) {
			return res.json({
				status: 400,
				message: "Username or Password not provided"
			});
		}
		const user = await UserModel.findOne({ name }, {}, null).exec();
		if (!bcrypt.compareSync(password, user.password)) return res.json({
			status: 400,
			message: "Password Incorrect"
		});
		return res.json({
			status: 200,
			message: "User verified",
			user_id: user._id,
			user_name: user.name
		});
	} catch (message) {
		return res.json({
			status: 500,
			message
		});
	}
});

export default router;
