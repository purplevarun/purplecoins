const dotenv = require("dotenv");
dotenv.config();
const websiteUrl = process.env.WEBSITE_URL;
const apiUrl = process.env.VITE_API_URL;
const headless = process.env.VITE_ACTIVE_ENV === "PROD";
const {
	openBrowser,
	goto,
	textBox,
	write,
	button,
	click,
	text,
	closeBrowser,
	focus,
	waitFor,
	clear,
} = require("taiko");
const assert = require("assert");
const { post } = require("axios");
step("open browser", async () => {
	await openBrowser({ headless });
	await goto(websiteUrl);
	assert.ok(text("purplecoins").isVisible());
});
step("close browser", async () => {
	await closeBrowser();
});
step("enter username abcd", async () => {
	await textBox({ id: "username_input" }).isVisible();
	await write("abcd");
});
step("delete user abcd", async () => {
	await post(`${apiUrl}/user/delete`, {
		userName: "abcd",
		password: "1234",
	}).catch(() => {});
});
const clickProceedBtn = async () => {
	await button("proceed").isVisible();
	await click(button("proceed"), {
		navigationTimeout: 60000,
		force: true,
	});
};
step("click proceed btn", async () => {
	await clickProceedBtn();
});
step("verify user does not exist", async () => {
	assert.ok(text("user does not exist").isVisible());
	assert.ok(text("creating new user").isVisible());
});
step("incorrect password check", async () => {
	await textBox({ id: "password_input" }).isVisible();
	await write("1111");
	await clickProceedBtn();
	assert.ok(text("incorrect password").isVisible());
	await textBox({ id: "password_input" }).isVisible();
	await focus(textBox({ id: "password_input" }));
	await clear(textBox({ id: "password_input" }));
});
step("correct password check", async () => {
	await textBox({ id: "password_input" }).isVisible();
	await write("1234");
});
