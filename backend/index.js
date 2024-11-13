import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import checkUser from "./routes/user/check_user.js";
import createUser from "./routes/user/create_user.js";
import verifyUser from "./routes/user/verify_user.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
mongoose.connect(process.env.MONGO_URL);

app.use("/check-user", checkUser);
app.use("/create-user", createUser);
app.use("/verify-user", verifyUser);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
