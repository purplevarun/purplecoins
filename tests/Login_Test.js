const {
	openBrowser,
	goto,
	textBox,
	focus,
	write,
	button,
	click,
	text,
	closeBrowser,
} = require("taiko");
const assert = require("assert");
const dotenv = require("dotenv");
dotenv.config();
const websiteUrl = process.env.WEBSITE_URL;
step("open browser", async () => {
	await openBrowser({ headless: false });
	await goto(websiteUrl);
	assert.ok(text("purplecoins").exists());
});

step("close browser", async () => {
	await closeBrowser();
});

step("enter wrong username", async () => {
	await focus(textBox({ type: "text" }));
	await write("abcd");
});

step("click login btn", async () => {
	await button("login").exists();
	await click(button("login"), {
		navigationTimeout: 60000,
		force: true,
	});
});

step("verify user does not exist", async () => {
	assert.ok(text("user does not exist").exists());
	assert.ok(button("try again").exists());
	assert.ok(button("register").exists());
});
