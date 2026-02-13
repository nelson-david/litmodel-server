const mongoose = require("mongoose");

const scoutedModelSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    instagramHandle: {
        type: String,
        required: true,
    },
    residentialAddress: {
        type: String,
        required: true,
    },
    measurement: {
        type: {
            height: String,
            hair: String,
            chestBust: String,
            waist: String,
            hips: String,
            shoe: String,
        },
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    polaroid: {
        type: Array,
        required: true,
    },
    dateAdded: {
        type: Date,
        default: new Date().toISOString(),
    },
});

const ScoutedModel = mongoose.model("ScoutedModel", scoutedModelSchema);

module.exports = ScoutedModel;
