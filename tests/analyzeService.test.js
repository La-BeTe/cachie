
const Cache = require("../src/models/cache");
const analyzeService = require("../src/services/analyze");

beforeEach(() => {
  Cache.reset();
});

describe("analyzeService", () => {
  test("should return correct stats for existing tokens", () => {
    Cache.set("the quick", {
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
      searchQueriesContainingFuzzyMatch: {},
      clientDistribution: {
        client_123: { count: 1, sessions: new Set(["session_1"]) },
      },
    });

    const analysis = analyzeService(["the quick"], cache);
    expect(analysis["the quick"]).toMatchObject({
      exact_matches: 1,
      fuzzy_matches: 0,
      unique_sessions: 1,
      client_distribution: { client_123: 1 },
    });
  });

  test("should handle non-existent tokens gracefully", () => {
    const analysis = analyzeService(["non existent token"], cache);
    expect(analysis["non existent token"]).toMatchObject({
      exact_matches: 0,
      fuzzy_matches: 0,
      unique_sessions: 0,
      client_distribution: {},
    });
  });

  test("should return combined stats for multiple tokens", () => {
    Cache.set("the quick", {
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
      searchQueriesContainingFuzzyMatch: {},
      clientDistribution: {
        client_123: { count: 1, sessions: new Set(["session_1"]) },
      },
    });

    Cache.set("the lazy", {
      searchQueriesContainingExactMatch: { "the lazy dog": 1 },
      searchQueriesContainingFuzzyMatch: {},
      clientDistribution: {
        client_456: { count: 1, sessions: new Set(["session_2"]) },
      },
    });

    const analysis = analyzeService(["the quick", "the lazy"], cache);
    expect(analysis).toMatchObject({
      "the quick": {
        exact_matches: 1,
        fuzzy_matches: 0,
        unique_sessions: 1,
        client_distribution: { client_123: 1 },
      },
      "the lazy": {
        exact_matches: 1,
        fuzzy_matches: 0,
        unique_sessions: 1,
        client_distribution: { client_456: 1 },
      },
    });
  });
});

