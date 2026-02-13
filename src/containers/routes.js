const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const responseTime = require("response-time");

// const AdminAuth = require("../routes/admin");
const Index = require("../routes");
const error = require("../middlewares/error");

var corsOptions = {
    exposedHeaders: "x-auth-token",
    origin: "*",
};

module.exports = function (app) {
    app.use(
        responseTime(function (req, res, time) {
            console.log("TIME:", `${time}MS`);
        })
    );

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(express.static("public"));
    app.use(compression());

    // Admin
    // Category Route
    // app.use("/api/v1/admin/auth", AdminAuth);
    // app.use("/api/v1/user", UserRoutes);
    // app.use("/api/v1/category", CategoryRoutes);
    // app.use("/api/v1/product", ProductRoutes);
    // app.use("/api/v1/cart", CartRoutes);
    // app.use("/api/v1/order", OrderRoutes);
    // app.use("/api/v1/favourite", FavouriteRoutes);
    // app.use("/api/v1/review", ReviewRoutes);
    // app.use("/api/v1/address", AddressRoutes);

    // PUBLIC

    //Auth
    // app.use("/api/v1/auth", AuthRoutes);
    // app.use("/api/v1/newsletter", NewsletterRoutes);
    const Upload = require("../routes/upload");
    app.use("/api/v1/upload", Upload);

    app.use("/api/v1/", Index);
    app.use("/api/", Index);
    app.use("/", Index);

    // app.use("*", (req, res) => {
    //     res.status(404).json({
    //         data: {},
    //         status: "failed",
    //         message: "Please, try again later (555)",
    //     });
    // });
    app.use(error);
};
