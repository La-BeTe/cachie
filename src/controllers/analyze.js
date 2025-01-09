const analyzeService = require("../services/analyze");

module.exports = function (req, res, next) {
	try {
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
