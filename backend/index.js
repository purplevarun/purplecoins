import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import checkUser from "./routes/user/check_user.js";
import createUser from "./routes/user/create_user.js";
import verifyUser from "./routes/user/verify_user.js";
import uploadData from "./routes/data/uploadData.js";
import downloadData from "./routes/data/downloadData.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
await mongoose.connect(process.env.MONGO_URL);

app.use("/check-user", checkUser);
app.use("/create-user", createUser);
app.use("/verify-user", verifyUser);
app.use("/upload-data", uploadData);
app.use("/download-data", downloadData);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
