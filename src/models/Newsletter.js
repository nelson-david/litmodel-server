const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
    },
    dateSubscribed: {
        type: Date,
        default: new Date().toISOString(),
    },
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
