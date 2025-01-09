const request = require("supertest");
const app = require("../src/app"); // Import the Express app
const Cache = require("../src/models/cache");

describe("E2E Tests for Cachie API", () => {
	beforeEach(() => {
		Cache.reset(); // Reset the cache before each test
	});

	describe("POST /search", () => {
		it("should process a search query and return processed tokens", async () => {
			const response = await request(app)
				.post("/search")
				.send({
					search_query: "The quick brown fox",
					client_id: "client_123",
					session_id: "session_1",
				})
				.set("Content-Type", "application/json");

			expect(response.status).toBe(201);
			expect(response.body).toEqual({
				status: "ok",
				processed_tokens: 4,
				processing_time: expect.stringMatching(/^\d+ms$/),
			});
		});

		it("should return an error for invalid input", async () => {
			const response = await request(app)
				.post("/search")
				.send({ search_query: "", client_id: "", session_id: "" })
				.set("Content-Type", "application/json");

			expect(response.status).toBe(400);
			expect(response.body).toEqual({
				message: "Search query, client and session ID must be passed in.",
				status: "error",
			});
		});
	});

	describe("GET /analyse", () => {
		beforeEach(async () => {
			// Seed the cache with some data
			await request(app)
				.post("/search")
				.send({
					search_query: "The quick brown fox",
					client_id: "client_123",
					session_id: "session_1",
				})
				.set("Content-Type", "application/json");

			await request(app)
				.post("/search")
				.send({
					search_query: "The quickly moving fox",
					client_id: "client_123",
					session_id: "session_2",
				})
				.set("Content-Type", "application/json");
		});

		it("should return analysis results with exact matches", async () => {
			const response = await request(app).get("/analyse").query({
				analysis_token: "the quick",
				match_type: "exact",
				include_stats: false,
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				results: {
					"the quick": {
						exact_matches: 1,
						fuzzy_matches: 0,
						client_distribution: {
							client_123: 1,
						},
						unique_sessions: 1,
					},
				},
				stats: {
					processing_time: expect.stringMatching(/^\d+ms$/),
					total_searches_analyzed: 0,
					unique_clients: 0,
					unique_sessions: 0,
				},
			});
		});

		it("should return analysis results with fuzzy matches", async () => {
			const response = await request(app).get("/analyse").query({
				analysis_token: "the quick",
				match_type: "fuzzy",
				include_stats: true,
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				results: {
					"the quick": {
						exact_matches: 1,
						fuzzy_matches: 2,
						client_distribution: {
							client_123: 2,
						},
						unique_sessions: 2,
					},
				},
				stats: {
					processing_time: expect.stringMatching(/^\d+ms$/),
					total_searches_analyzed: 2,
					unique_clients: 1,
					unique_sessions: 2,
				},
			});
		});

		it("should return an error for invalid query parameters", async () => {
			const response = await request(app).get("/analyse").query({
				analysis_token: "",
			});

			expect(response.status).toBe(400);
			expect(response.body).toEqual({
				message: "Empty value found for query parameter 'analysis_token'.",
				status: "error",
			});
		});
	});
});
