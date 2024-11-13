import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	// id: { type: String, required: true, unique: true },
	name: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
