const Joi = require("joi");
const Response = require("../utils/response");
const searchService = require("../services/search");

const searchSchema = Joi.object({
	client_id: Joi.string().required(),
	session_id: Joi.string().required(),
	search_query: Joi.string().required(),
});

module.exports = function (req, res, next) {
	try {
		const { error } = searchSchema.validate(req.body);
		if (error) return next(new Response(error?.details?.[0]?.message || "Validation error occurred.", 400));
		const start = Date.now();
		const processedTokens = searchService(req.body.search_query, req.body.client_id, req.body.session_id);
		res.status(201).json({
			status: "ok",
			processed_tokens: processedTokens,
			processing_time: Date.now() - start + "ms",
		});
	} catch (err) {
		next(err);
	}
};
