import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
	return res.json({
		status: 200,
		message: "Purplecoins server is running",
	});
});

export default router;
