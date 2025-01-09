const searchService = require("../services/search");
const Response = require("../utils/response");

module.exports = function (req, res, next) {
	try {
		if (!req.body.search_query.trim() || !req.body.client_id.trim() || !req.body.session_id.trim())
			return next(new Response("Search query, client and session ID must be passed in.", 400));
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
