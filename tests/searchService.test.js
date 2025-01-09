const Cache = require("../src/models/cache");
const searchService = require("../src/services/search");

beforeEach(() => {
  Cache.reset();  // Reset the Cache instance before each test
});

describe("searchService", () => {
  test("should cache a new search query correctly", () => {
    const processedTokens = searchService("The quick brown fox", "client_123", "session_1");
    expect(processedTokens).toBe(4);
    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery).toBeDefined();
    expect(cachedQuery.clientDistribution).toMatchObject({
      client_123: {
        count: 1,
        sessions: new Set(["session_1"]),
      },
    });
  });

  test("should handle duplicate queries for the same client and session", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    searchService("The quick brown fox", "client_123", "session_1");
    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery.clientDistribution.client_123.count).toBe(1);
  });

  test("should track queries across multiple sessions", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    searchService("The quick brown fox", "client_123", "session_2");
    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery.clientDistribution.client_123.sessions.size).toBe(2);
  });

  test("should create fuzzy matches between related queries", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    searchService("The quickly moving fox", "client_123", "session_2");
    const cachedQuery = Cache.get("the quick");
    expect(cachedQuery.searchQueriesContainingFuzzyMatch).toMatchObject({
        "the quick brown fox": 1,
        "the quickly moving fox": 1,
    });
  });

  test("should cache a new search query correctly for multiple clients", () => {
    const processedTokensClient1 = searchService("The quick brown fox", "client_123", "session_1");
    const processedTokensClient2 = searchService("The quick brown fox", "client_456", "session_2");

    expect(processedTokensClient1).toBe(4);
    expect(processedTokensClient2).toBe(4);

    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery).toBeDefined();
    expect(cachedQuery.clientDistribution).toMatchObject({
      client_123: {
        count: 1,
        sessions: new Set(["session_1"]),
      },
      client_456: {
        count: 1,
        sessions: new Set(["session_2"]),
      },
    });
  });

  test("should track multiple sessions for a single client", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    searchService("The quick brown fox", "client_123", "session_2");

    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery.clientDistribution.client_123.sessions.size).toBe(2);
    expect(cachedQuery.clientDistribution.client_123.count).toBe(2); // should increment the count for each session
  });

  test("should handle multiple clients with multiple sessions", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    searchService("The quick brown fox", "client_123", "session_2");
    searchService("The quick brown fox", "client_456", "session_1");
    searchService("The quick brown fox", "client_456", "session_2");

    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery.clientDistribution.client_123.sessions.size).toBe(2);
    expect(cachedQuery.clientDistribution.client_456.sessions.size).toBe(2);
    expect(cachedQuery.clientDistribution.client_123.count).toBe(2);
    expect(cachedQuery.clientDistribution.client_456.count).toBe(2);
  });

  test("should prevent multiple identical requests from the same client-session combination", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    const processedTokens = searchService("The quick brown fox", "client_123", "session_1");
    
    expect(processedTokens).toBe(4);  // Should return the same count, no new processing for same client-session
    const cachedQuery = Cache.get("the quick brown fox");
    expect(cachedQuery.clientDistribution.client_123.sessions.size).toBe(1);  // Should remain 1 session
  });

  test("should track different tokens for the same client across sessions", () => {
    searchService("The quick brown fox", "client_123", "session_1");
    searchService("The quick brown fox jumps", "client_123", "session_2");

    const cachedQuery = Cache.get("the quick");
    expect(cachedQuery).toBeDefined();
    expect(cachedQuery.clientDistribution.client_123.sessions.size).toBe(2); // Same client, different sessions
  });
});