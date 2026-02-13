module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");
    if (!token)
        return failedResponse(res, 401, "Access Denied. No Token Provided");

    if (token === "thisistheadmintoken") {
        next();
    } else {
        return failedResponse(res, 400, "Invalid Token");
    }
};
