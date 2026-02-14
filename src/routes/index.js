const successResponse = require("../helpers/successResponse");
const Model = require("../models/Model");
const ScoutedModel = require("../models/ScoutedModel");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const NodeCache = require("node-cache");

const router = require("express").Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Cache Keys
const ALL_MODELS_KEY = "all_models";
const ALL_SCOUTED_MODELS_KEY = "all_scouted_models";

router.get("/", (_, res) => {
	return res.send({ name: "David Nelson", title: "Source to Test the API" });
});

// Model Endpoints

// Fetch all models
router.get("/model/all", async (_, res) => {
	// Check cache first
	const cachedModels = cache.get(ALL_MODELS_KEY);
	if (cachedModels) {
		return successResponse(
			res,
			200,
			cachedModels,
			"Successfully fetched all models (cached)",
		);
	}

	// If not in cache, fetch from DB
	const models = await Model.find({}).sort({ dateAdded: -1, fullName: 1 });

	// Store in cache
	cache.set(ALL_MODELS_KEY, models);

	return successResponse(res, 200, models, "Successfully fetched all models");
});

router.post("/model/add/", async (req, res) => {
	const data = req.body;
	const newModel = new Model(data);
	await newModel.save();

	// Update cache
	const cachedModels = cache.get(ALL_MODELS_KEY) || [];
	// Prepend new model (since we sort by dateAdded: -1)
	const updatedModels = [newModel, ...cachedModels];
	cache.set(ALL_MODELS_KEY, updatedModels);

	return successResponse(res, 200, newModel, "Successfully added a new model");
});

router.get("/model/:id/", async (req, res) => {
	const { id } = req.params;

	// We could also cache individual models, but for now let's keep it simple
	// or check if it's in the all_models cache
	let model = await Model.findById(id);

	return successResponse(res, 200, model, "Successfully fetched model");
});

router.put("/model/:id/edit/", async (req, res) => {
	const data = req.body;
	const { id } = req.params;

	const model = await Model.findByIdAndUpdate(id, data, { new: true });

	// Update cache
	const cachedModels = cache.get(ALL_MODELS_KEY);
	if (cachedModels) {
		const updatedModels = cachedModels.map((m) =>
			m._id.toString() === id ? model : m,
		);
		cache.set(ALL_MODELS_KEY, updatedModels);
	}

	return successResponse(res, 200, model, "Successfully updated a model");
});

router.delete("/model/:id/delete/", async (req, res) => {
	const { id } = req.params;
	let model = await Model.findOneAndDelete(id);

	// Update cache
	const cachedModels = cache.get(ALL_MODELS_KEY);
	if (cachedModels) {
		const updatedModels = cachedModels.filter((m) => m._id.toString() !== id);
		cache.set(ALL_MODELS_KEY, updatedModels);
	}

	return successResponse(res, 200, model, "Successfully deleted a model");
});
// End of Model Endpoints

// Scouted Model Endpoints

// Fetch all scouted models
router.get("/scouted-model/all", async (_, res) => {
	// Check cache
	const cachedScoutedModels = cache.get(ALL_SCOUTED_MODELS_KEY);
	if (cachedScoutedModels) {
		return successResponse(
			res,
			200,
			cachedScoutedModels,
			"Successfully fetched all scouted models (cached)",
		);
	}

	const scoutedModels = await ScoutedModel.find({}).sort({ dateAdded: -1 });

	// Store in cache
	cache.set(ALL_SCOUTED_MODELS_KEY, scoutedModels);

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

	// Update cache
	const cachedScoutedModels = cache.get(ALL_SCOUTED_MODELS_KEY) || [];
	const updatedScoutedModels = [newScoutedModel, ...cachedScoutedModels];
	cache.set(ALL_SCOUTED_MODELS_KEY, updatedScoutedModels);

	return successResponse(
		res,
		200,
		newScoutedModel,
		"Successfully added a new scouted model",
	);
});

module.exports = router;
