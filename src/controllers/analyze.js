const Joi = require("joi");
const Response = require("../utils/response");
const analyzeService = require("../services/analyze");

const analyzeSchema = Joi.object({
	analysis_token: Joi.string().required(),
	include_stats: Joi.boolean().optional(),
	match_type: Joi.string().valid("exact", "fuzzy").optional(),
});

module.exports = function (req, res, next) {
	try {
		const { error } = analyzeSchema.validate(req.query);
		if (error) return next(new Response(error?.details?.[0]?.message || "Validation error occurred.", 400));

		const matchType = req.query.match_type || "exact";
		const includeStats = req.query.include_stats === "true";
		const analysisTokens = req.query.analysis_token.split(",");
		const start = Date.now();
		const { results, stats } = analyzeService(analysisTokens, matchType, includeStats);
		stats.processing_time = Date.now() - start + "ms";
		res.status(201).json({
			status: "ok",
			results,
			stats: includeStats ? stats : null,
		});
	} catch (err) {
		next(err);
	}
};
