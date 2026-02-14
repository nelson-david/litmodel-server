require("dotenv").config();
const express = require("express");
const app = express();

require("./src/containers/logger")();
require("./src/containers/routes")(app);

const PORT = process.env.PORT;

const cron = require("node-cron");
const https = require("https");
const axios = require("axios");

const startServer = async () => {
	try {
		await require("./src/containers/database")();

		app.listen(PORT, () => {
			console.log("Server is running on port - v2: ", PORT);

			cron.schedule("*/5 * * * *", () => {
				console.log("Running keep-alive cron job");
				const serverUrl =
					process.env.SERVER_URL || `https://api-v1.litmodelmanagement.com/`;

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
	} catch (error) {
		console.error("Failed to connect to database or start server:", error);
		process.exit(1);
	}
};

startServer();

module.exports = app;
