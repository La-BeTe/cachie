const Cache = require("../src/models/cache");
const analyzeService = require("../src/services/analyze");

jest.mock("../src/models/cache");

describe("analyzeService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test.only("should analyze exact matches correctly", () => {
		Cache.get.mockImplementation((token) => {
			if (token === "the quick") {
				return {
					searchQueriesContainingExactMatch: {
						"The quick brown fox": 1,
						"The quick brown dog": 1,
					},
					clientDistribution: {
						client_123: { count: 2, sessions: new Set(["session_1", "session_2"]) },
					},
				};
			}
			return null;
		});

		const result = analyzeService(["the quick brown fox"], "exact", false);

		expect(result.results["the quick brown fox"]).toEqual({
			exact_matches: 2,
			fuzzy_matches: 0,
			unique_sessions: 2,
			client_distribution: {
				client_123: 2,
			},
		});
		expect(result.stats).toEqual({
			unique_clients: 1,
			unique_sessions: 2,
			total_searches_analyzed: 2,
		});
	});

	test("should analyze fuzzy matches correctly when matchType is fuzzy", () => {
		Cache.get.mockImplementation((token) => {
			if (token === "the quick") {
				return {
					searchQueriesContainingExactMatch: {
						"The quick brown fox": 1,
					},
					searchQueriesContainingFuzzyMatch: {
						"The quickly moving fox": 1,
					},
					clientDistribution: {
						client_123: { count: 2, sessions: new Set(["session_1", "session_2"]) },
					},
				};
			}
			return null;
		});

		const result = analyzeService(["the quick"], "fuzzy", false);

		expect(result.results["the quick"]).toEqual({
			exact_matches: 1,
			fuzzy_matches: 1,
			unique_sessions: 2,
			client_distribution: {
				client_123: 2,
			},
		});
		expect(result.stats).toEqual({
			unique_clients: 1,
			unique_sessions: 2,
			total_searches_analyzed: 2,
		});
	});

	test("should include stats if includeStats is true", () => {
		Cache.get.mockImplementation((token) => {
			if (token === "the quick") {
				return {
					searchQueriesContainingExactMatch: {
						"The quick brown fox": 1,
					},
					searchQueriesContainingFuzzyMatch: {},
					clientDistribution: {
						client_123: { count: 2, sessions: new Set(["session_1", "session_2"]) },
					},
				};
			}
			return null;
		});

		const result = analyzeService(["the quick"], "exact", true);

		expect(result.results["the quick"]).toEqual({
			exact_matches: 1,
			fuzzy_matches: 0,
			unique_sessions: 2,
			client_distribution: {
				client_123: 2,
			},
		});

		expect(result.stats).toEqual({
			unique_clients: 1,
			unique_sessions: 2,
			total_searches_analyzed: 1,
		});
	});

	test("should return empty results for non-existent tokens", () => {
		Cache.get.mockImplementation(() => null);

		const result = analyzeService(["nonexistent token"], "exact", false);

		expect(result.results["nonexistent token"]).toEqual({
			exact_matches: 0,
			fuzzy_matches: 0,
			unique_sessions: 0,
			client_distribution: {},
		});
		expect(result.stats).toEqual({
			unique_clients: 0,
			unique_sessions: 0,
			total_searches_analyzed: 0,
		});
	});
});
