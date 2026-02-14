const mongoose = require("mongoose");

const dbURL = process.env.DATABASE_URL;

module.exports = async function () {
	mongoose.set("strictQuery", true);
	try {
		const connected = await mongoose.connect(dbURL, {
			maxPoolSize: 50,
		});
		if (connected) {
			console.log("CONNECTED to DATABASE");
		}
	} catch (e) {
		console.log("Error happend while connecting to the DB: ", e.message);
		throw e;
	}
};
