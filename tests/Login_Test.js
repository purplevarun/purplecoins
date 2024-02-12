const {
	openBrowser,
	goto,
	textBox,
	focus,
	write,
	button,
	click,
	text,
	closeBrowser
} = require("taiko");
const nock = require("nock");
const assert = require("assert");
const dotenv = require("dotenv");
dotenv.config();
const websiteUrl = process.env.WEBSITE_URL;
const apiUrl = process.env.VITE_API_URL;
step("open browser", async () => {
	await openBrowser({ headless: false });
	await goto(websiteUrl);
	assert.ok(text("purplecoins").exists());
});
step("close browser", async () => {
	await closeBrowser();
});
step("enter wrong username", async () => {
	await textBox({ id: "username_input" }).exists();
	await write("abcd");
});

const clickProceedButton = async () => {
	await button("proceed").exists();
	await click(button("proceed"), {
		navigationTimeout: 60000,
		force: true
	});
};
step("click proceed btn", async () => {
	await clickProceedButton();
});
step("verify user does not exist", async () => {
	assert.ok(text("user does not exist").exists());
});
step("show password input box", async () => {
	await textBox({ id: "password_input" }).exists();
	await write("1234");
});