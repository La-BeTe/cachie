const Cache = require("../models/cache");

function analyzeString(queryStrings) {
	const results = {};

	queryStrings.forEach((str) => {
		const cacheEntry = Cache.get(str);

		if (cacheEntry) {
			results[str] = {
				exact_matches: Object.keys(cacheEntry.searchQueriesContainingExactMatch || {}).length,
				fuzzy_matches: Object.keys(cacheEntry.searchQueriesContainingFuzzyMatch || {}).length,
				...getClientDistributionAndSessions(
					Object.keys({
						...cacheEntry.searchQueriesContainingExactMatch,
						...cacheEntry.searchQueriesContainingFuzzyMatch,
					}),
				),
			};
		} else {
			results[str] = {
				exact_matches: 0,
				fuzzy_matches: 0,
				unique_sessions: 0,
				client_distribution: {},
			};
		}
	});

	return results;
}

function getClientDistributionAndSessions(cacheKeys) {
	let uniqueSessions = 0;
	const clientDistribution = {};

	cacheKeys.forEach((key) => {
		const cacheEntry = Cache.get(key);
		if (cacheEntry?.clientDistribution) {
			Object.keys(cacheEntry.clientDistribution).forEach((client) => {
				const clientData = cacheEntry.clientDistribution[client];
				uniqueSessions += clientData.sessions.size;
				clientDistribution[client] = (clientDistribution[client] || 0) + clientData.count;
			});
		}
	});

	return {
		unique_sessions: uniqueSessions,
		client_distribution: clientDistribution,
	};
}

module.exports = analyzeString;
