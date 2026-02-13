const mongoose = require("mongoose");

const dbURL = process.env.DATABASE_URL;

module.exports = function () {
    mongoose.set("strictQuery", true);
    (async () => {
        try {
            const connected = await mongoose.connect(dbURL, {
                maxPoolSize: 50,
            });
            if (connected) {
                // await updateProduct();
                console.log("CONNECTED to DATABASE");
            }
        } catch (e) {
            console.log(
                "Error happend while connecting to the DB: ",
                e.message
            );
        }
    })();
};
