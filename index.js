require("dotenv").config();
const express = require("express");
const app = express();

require("./src/containers/logger")();
require("./src/containers/database")();
require("./src/containers/routes")(app);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Server is running on port - v2: ", PORT);
});

module.exports = app;
