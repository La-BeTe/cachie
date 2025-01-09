const Cache = require("../models/cache");

function cacheSearchQuery(searchQuery, clientId, sessionId) {
	let searchQueryNormalized = searchQuery.trim().toLowerCase();
	const searchQueryArr = searchQueryNormalized.split(" ").filter((q) => !!q.trim());
	searchQueryNormalized = searchQueryArr.join(" ");

	if (Cache.get(searchQueryNormalized)?.clientDistribution?.[clientId]?.sessions?.has(sessionId))
		return searchQueryArr.length;

	for (let i = 0; i < searchQueryArr.length; i++) {
		for (let j = searchQueryArr.length; j > i; j--) {
			const token = searchQueryArr.slice(i, j).join(" ");
			let cachedToken = Cache.get(token);
			if (!cachedToken) {
				cachedToken = {
					normalizedSearchQuery: searchQueryNormalized,
					searchQueriesContainingExactMatch: {
						[searchQueryNormalized]: 1,
					},
				};
				Cache.set(token, cachedToken);
			} else {
				cachedToken.normalizedSearchQuery = searchQueryNormalized;
				cachedToken.searchQueriesContainingExactMatch = cachedToken.searchQueriesContainingExactMatch || {};
				cachedToken.searchQueriesContainingExactMatch[searchQueryNormalized] = 1;
			}

			const existingCacheTokens = Cache.getKeys();
			existingCacheTokens.forEach((existingToken) => {
				if (existingToken !== token && (existingToken.includes(token) || token.includes(existingToken))) {
					const existingTokenCacheEntry = Cache.get(existingToken);
					const cachedTokenToUpdateFuzzyMatchList = existingToken.includes(token)
						? cachedToken
						: existingTokenCacheEntry;
					const searchQueryThatWasFuzzyMatchedWith = existingToken.includes(token)
						? existingTokenCacheEntry.normalizedSearchQuery
						: searchQueryNormalized;
					cachedTokenToUpdateFuzzyMatchList.searchQueriesContainingFuzzyMatch =
						cachedTokenToUpdateFuzzyMatchList.searchQueriesContainingFuzzyMatch || {};
					cachedTokenToUpdateFuzzyMatchList.searchQueriesContainingFuzzyMatch[
						searchQueryThatWasFuzzyMatchedWith
					] = 1;
				}
			});
		}
	}

	const cacheEntry = Cache.get(searchQueryNormalized);
	if (cacheEntry) {
		cacheEntry.clientDistribution = cacheEntry.clientDistribution || {};
		cacheEntry.clientDistribution[clientId] = cacheEntry.clientDistribution[clientId] || {};
		cacheEntry.clientDistribution[clientId].sessions =
			cacheEntry.clientDistribution[clientId].sessions || new Set();
		cacheEntry.clientDistribution[clientId].count = (cacheEntry.clientDistribution[clientId].count || 0) + 1;
		cacheEntry.clientDistribution[clientId].sessions.add(sessionId);
	}

	return searchQueryArr.length;
}

module.exports = cacheSearchQuery;
