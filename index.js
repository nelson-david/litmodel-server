require("dotenv").config();
const express = require("express");
const app = express();

require("./src/containers/logger")();
require("./src/containers/database")();
require("./src/containers/routes")(app);

const PORT = process.env.PORT;

const cron = require("node-cron");
const https = require("https");

app.listen(PORT, () => {
	console.log("Server is running on port - v2: ", PORT);

	cron.schedule("*/5 * * * *", () => {
		console.log("Running keep-alive cron job");
		const serverUrl =
			process.env.SERVER_URL || `https://api-v1.litmodelmanagement.com/`;

		const axios = require("axios");
		axios
			.get(serverUrl)
			.then((response) => {
				console.log(`Keep-alive ping successful: ${response.status}`);
			})
			.catch((error) => {
				console.error("Keep-alive ping failed:", error.message);
			});
	});
});

module.exports = app;
