const Cache = require("../models/cache");

module.exports = function (tokensToAnalyse, matchType, includeStats) {
	const results = {};
	const resultStats = {
		clientsAnalyzed: new Map(),
		sessionsAnalyzed: new Map(),
		searchQueriesAnalyzed: new Map(),
	};

	tokensToAnalyse.forEach((token) => {
		const cacheEntry = Cache.get(token);
		results[token] = {
			exact_matches: 0,
			fuzzy_matches: 0,
			unique_sessions: 0,
			client_distribution: {},
		};
		if (!cacheEntry) return;

		results[token].exact_matches = Object.keys(cacheEntry.searchQueriesContainingExactMatch || {}).length;
		if (matchType === "fuzzy")
			results[token].fuzzy_matches = Object.keys(cacheEntry.searchQueriesContainingFuzzyMatch || {}).length;

		Object.keys({
			...cacheEntry.searchQueriesContainingExactMatch,
			...(matchType === "fuzzy" ? cacheEntry.searchQueriesContainingFuzzyMatch : {}),
		}).forEach((key) => {
			const cacheEntry = Cache.get(key);
			if (cacheEntry?.clientDistribution) {
				Object.keys(cacheEntry.clientDistribution).forEach((client) => {
					const clientData = cacheEntry.clientDistribution[client];
					results[token].unique_sessions = (results[token]?.unique_sessions || 0) + clientData.sessions.size;
					results[token].client_distribution[client] =
						(results[token]?.client_distribution?.[client] || 0) + clientData.count;

					if (includeStats) {
						// Keep track of statistics for entire result set
						resultStats.clientsAnalyzed.set(client, 1);
						resultStats.searchQueriesAnalyzed.set(key, 1);
						clientData.sessions.forEach((session) => resultStats.sessionsAnalyzed.set(client + session, 1));
					}
				});
			}
		});
	});

	return {
		results,
		stats: {
			unique_clients: resultStats.clientsAnalyzed.size,
			unique_sessions: resultStats.sessionsAnalyzed.size,
			total_searches_analyzed: resultStats.searchQueriesAnalyzed.size,
		},
	};
};
