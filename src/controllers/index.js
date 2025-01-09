const express = require("express");
const rateLimit = require("express-rate-limit");

const searchController = require("./search");
const Response = require("../utils/response");
const analyseController = require("./analyse");

const router = express.Router();

const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 100;
const WINDOW_MS = (Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60) * 1000; // Default to 15 minutes if not set
const rateLimiter = rateLimit({
	max: MAX_REQUESTS,
	windowMs: WINDOW_MS,
	legacyHeaders: false,
	standardHeaders: true,
	keyGenerator: (req) => req.body.client_id,
	handler: (_, res, __, ___) => {
		// Override the default response with a JSON format
		res.status(429).json({
			status: "error",
			message: "Too many requests from this client, please try again later.",
		});
	},
});

router.get("/analyse", analyseController);

router.post("/search", rateLimiter, searchController);

router.use((req, _, next) => {
	next(new Response(`Cannot ${req.method} ${req.url}, endpoint not available`, 404));
});

module.exports = router;
