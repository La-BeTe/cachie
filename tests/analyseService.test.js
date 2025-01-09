const Cache = require("../src/models/cache");
const analyseService = require("../src/services/analyse");

describe("analyseService", () => {
	beforeEach(() => {
		Cache.reset();

		// Seed the Cache with test data
		Cache.set("the quick", {
			searchQueriesContainingExactMatch: { "the quick": 1 },
			searchQueriesContainingFuzzyMatch: { "the quickly": 1 },
			clientDistribution: {
				client_123: {
					sessions: new Set(["session_1", "session_2"]),
					count: 2,
				},
			},
		});

		Cache.set("the quickly", {
			searchQueriesContainingExactMatch: { "the quickly": 1 },
			clientDistribution: {
				client_123: {
					sessions: new Set(["session_2"]),
					count: 1,
				},
			},
		});
	});

	test("should return correct stats for exact matches only", () => {
		const tokensToAnalyze = ["the quick"];
		const matchType = "exact";
		const includeStats = false;

		const result = analyseService(tokensToAnalyze, matchType, includeStats);

		expect(result).toEqual({
			results: {
				"the quick": {
					exact_matches: 1,
					fuzzy_matches: 0,
					unique_sessions: 2,
					client_distribution: {
						client_123: 2,
					},
				},
			},
			stats: {
				unique_clients: 0,
				unique_sessions: 0,
				total_searches_analyzed: 0,
			},
		});
	});

	test("should return correct stats for fuzzy matches", () => {
		const tokensToAnalyze = ["the quick"];
		const matchType = "fuzzy";
		const includeStats = false;

		const result = analyseService(tokensToAnalyze, matchType, includeStats);

		expect(result).toEqual({
			results: {
				"the quick": {
					exact_matches: 1,
					fuzzy_matches: 1,
					unique_sessions: 3,
					client_distribution: {
						client_123: 3,
					},
				},
			},
			stats: {
				unique_clients: 0,
				unique_sessions: 0,
				total_searches_analyzed: 0,
			},
		});
	});

	test("should include detailed stats when includeStats is true", () => {
		const tokensToAnalyze = ["the quick"];
		const matchType = "fuzzy";
		const includeStats = true;

		const result = analyseService(tokensToAnalyze, matchType, includeStats);

		expect(result).toEqual({
			results: {
				"the quick": {
					exact_matches: 1,
					fuzzy_matches: 1,
					unique_sessions: 3,
					client_distribution: {
						client_123: 3,
					},
				},
			},
			stats: {
				unique_clients: 1,
				unique_sessions: 2,
				total_searches_analyzed: 2,
			},
		});
	});

	test("should handle tokens that do not exist in the cache", () => {
		const tokensToAnalyze = ["nonexistent"];
		const matchType = "exact";
		const includeStats = false;

		const result = analyseService(tokensToAnalyze, matchType, includeStats);

		expect(result).toEqual({
			results: {
				nonexistent: {
					exact_matches: 0,
					fuzzy_matches: 0,
					unique_sessions: 0,
					client_distribution: {},
				},
			},
			stats: {
				unique_clients: 0,
				unique_sessions: 0,
				total_searches_analyzed: 0,
			},
		});
	});

	test("should process multiple tokens correctly", () => {
		const tokensToAnalyze = ["the quick", "the quickly"];
		const matchType = "fuzzy";
		const includeStats = false;

		const result = analyseService(tokensToAnalyze, matchType, includeStats);

		expect(result).toEqual({
			results: {
				"the quick": {
					exact_matches: 1,
					fuzzy_matches: 1,
					unique_sessions: 3,
					client_distribution: {
						client_123: 3,
					},
				},
				"the quickly": {
					exact_matches: 1,
					fuzzy_matches: 0,
					unique_sessions: 1,
					client_distribution: {
						client_123: 1,
					},
				},
			},
			stats: {
				unique_clients: 0,
				unique_sessions: 0,
				total_searches_analyzed: 0,
			},
		});
	});
});
