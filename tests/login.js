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
const assert = require("assert");
const dotenv = require("dotenv");
dotenv.config();
const websiteUrl = process.env.WEBSITE_URL;
step("Open the browser", async () => {
	await openBrowser({ headless: false });
	await goto(websiteUrl);
});

step("Enter text in the text box", async () => {
	await focus(textBox({ type: "text" }));
	await write("abcd");
});

step("Proceed to submit", async () => {
	await button("proceed").exists();
	await click(button("proceed"), {
		navigationTimeout: 60000,
		force: true
	});
});

step("Verify user does not exist", async () => {
	assert.ok(text("user does not exist").exists());
});

step("Close the browser", async () => {
	await closeBrowser();
});
