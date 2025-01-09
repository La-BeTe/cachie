const CACHE = require("../models/cache");  // Import the CACHE instance

beforeEach(() => {
  CACHE.reset();  // Reset the CACHE instance before each test
});

describe("CACHE Class Model", () => {
  test("should store a new entry correctly with TTL", () => {
    CACHE.set("the quick brown fox", {
      clientDistribution: { client_123: { count: 1, sessions: new Set(["session_1"]) } },
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
    });

    const cachedQuery = CACHE.get("the quick brown fox");
    expect(cachedQuery).toBeDefined();
    expect(cachedQuery.clientDistribution).toMatchObject({
      client_123: { count: 1, sessions: new Set(["session_1"]) },
    });
  });

  test("should return null for an expired key", () => {
    CACHE.set("the quick brown fox", {
      clientDistribution: { client_123: { count: 1, sessions: new Set(["session_1"]) } },
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
    });

    // Simulate waiting for 16 minutes (more than default TTL)
    jest.advanceTimersByTime(16 * 60 * 1000);  // Advance time by 16 minutes

    const cachedQuery = CACHE.get("the quick brown fox");
    expect(cachedQuery).toBeNull();  // Cache should return null for expired key
  });

  test("should return the cached value before expiration", () => {
    CACHE.set("the quick brown fox", {
      clientDistribution: { client_123: { count: 1, sessions: new Set(["session_1"]) } },
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
    });

    const cachedQueryBeforeExpiry = CACHE.get("the quick brown fox");
    expect(cachedQueryBeforeExpiry).toBeDefined();  // Should return the cached value

    // Simulate waiting for a short period (less than TTL)
    jest.advanceTimersByTime(5 * 60 * 1000);  // Advance time by 5 minutes

    const cachedQueryAfterWaiting = CACHE.get("the quick brown fox");
    expect(cachedQueryAfterWaiting).toBeDefined();  // Should still return the cached value
  });

  test("should return null for a non-existent key", () => {
    const cachedQuery = CACHE.get("non-existent key");
    expect(cachedQuery).toBeNull();  // Cache should return null for non-existent keys
  });

  test("should reset cache correctly", () => {
    CACHE.set("the quick brown fox", {
      clientDistribution: { client_123: { count: 1, sessions: new Set(["session_1"]) } },
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
    });

    let cachedQuery = CACHE.get("the quick brown fox");
    expect(cachedQuery).toBeDefined();

    // Reset the cache
    CACHE.reset();

    cachedQuery = CACHE.get("the quick brown fox");
    expect(cachedQuery).toBeNull();  // Cache should be cleared and return null
  });

  test("should not overwrite cache if key exists and is not explicitly set", () => {
    CACHE.set("the quick brown fox", {
      clientDistribution: { client_123: { count: 1, sessions: new Set(["session_1"]) } },
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
    });

    // Check initial state
    const cachedQueryBefore = CACHE.get("the quick brown fox");
    expect(cachedQueryBefore).toBeDefined();

    // Not setting anything new
    const cachedQueryAfter = CACHE.get("the quick brown fox");
    expect(cachedQueryAfter).toBe(cachedQueryBefore);  // Should remain the same
  });

  test("should store and retrieve multiple distinct entries", () => {
    CACHE.set("the quick brown fox", {
      clientDistribution: { client_123: { count: 1, sessions: new Set(["session_1"]) } },
      searchQueriesContainingExactMatch: { "the quick brown fox": 1 },
    });

    CACHE.set("the lazy dog", {
      clientDistribution: { client_456: { count: 2, sessions: new Set(["session_2", "session_3"]) } },
      searchQueriesContainingExactMatch: { "the lazy dog": 2 },
    });

    const cachedQuery1 = CACHE.get("the quick brown fox");
    const cachedQuery2 = CACHE.get("the lazy dog");

    expect(cachedQuery1).toBeDefined();
    expect(cachedQuery2).toBeDefined();
    expect(cachedQuery1.clientDistribution.client_123.sessions.size).toBe(1);
    expect(cachedQuery2.clientDistribution.client_456.sessions.size).toBe(2);
  });
});
