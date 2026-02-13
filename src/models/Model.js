const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
    headerImage: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    measurement: {
        type: {
            height: String,
            waist: String,
            eye: String,
            hip: String,
            dressSize: String,
            shoe: String,
            chestBust: String,
        },
        required: true,
    },
    portfolio: {
        type: Object,
        required: true,
    },
    polaroid: {
        type: Array,
        required: true,
    },
    newFace: {
        type: Boolean,
    },
    topModel: {
        type: Boolean,
    },
    gender: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        default: new Date().toISOString(),
    },
});

const Model = mongoose.model("Model", modelSchema);

module.exports = Model;
