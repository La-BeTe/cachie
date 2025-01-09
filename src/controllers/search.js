const searchService = require("../services/search");

module.exports = function (req, res, next) {
	try {
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
