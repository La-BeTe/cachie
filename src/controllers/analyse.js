const analyzeService = require("../services/analyse");

module.exports = function (req, res, next) {
	try {
		const matchType = req.query.match_type || "exact";
		const analysisTokens = req.query.analysis_token.split(",");
		const includeStats = req.query.include_stats || req.query.include_stats === "true";
		const start = Date.now();
		const { results, stats } = analyzeService(analysisTokens, matchType, includeStats);
		stats.processing_time = Date.now() - start + "ms";
		res.status(200).json({
			results,
			stats,
		});
	} catch (err) {
		next(err);
	}
};
