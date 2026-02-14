const successResponse = require("../helpers/successResponse");
const Model = require("../models/Model");
const ScoutedModel = require("../models/ScoutedModel");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const router = require("express").Router();

router.get("/", (_, res) => {
	return res.send({ name: "David Nelson", title: "Source to Test the API" });
});

// Model Endpoints

// Fetch all models
router.get("/model/all", async (_, res) => {
	const models = await Model.find({}).sort({ dateAdded: -1, fullName: 1 });
	return successResponse(res, 200, models, "Successfully fetched all models");
});

router.post("/model/add/", async (req, res) => {
	const data = req.body;
	const newModel = new Model(data);
	await newModel.save();

	return successResponse(res, 200, newModel, "Successfully added a new model");
});

router.get("/model/:id/", async (req, res) => {
	const { id } = req.params;
	let model = await Model.findById(id);

	return successResponse(res, 200, model, "Successfully fetched model");
});

router.put("/model/:id/edit/", async (req, res) => {
	const data = req.body;
	const { id } = req.params;

	const model = await Model.findByIdAndUpdate(id, data, { new: true });

	return successResponse(res, 200, model, "Successfully updated a model");
});

router.delete("/model/:id/delete/", async (req, res) => {
	const { id } = req.params;
	let model = await Model.findOneAndDelete(id);

	return successResponse(res, 200, model, "Successfully deleted a model");
});
// End of Model Endpoints

// Scouted Model Endpoints

// Fetch all scouted models
router.get("/scouted-model/all", async (_, res) => {
	const scoutedModels = await ScoutedModel.find({}).sort({ dateAdded: -1 });
	return successResponse(
		res,
		200,
		scoutedModels,
		"Successfully fetched all scouted models",
	);
});

router.post("/scouted-model/add/", uploadMiddleware, async (req, res) => {
	const data = req.body;
	console.log("DATA: ", data);
	const newScoutedModel = new ScoutedModel(data);
	await newScoutedModel.save();

	return successResponse(
		res,
		200,
		newScoutedModel,
		"Successfully added a new scouted model",
	);
});

module.exports = router;
