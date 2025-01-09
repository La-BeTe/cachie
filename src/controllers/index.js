const express = require("express");
const router = express.Router();

const searchController = require("./search");
const Response = require("../utils/response");
const analyzeController = require("./analyze");

router.get("/analyze", analyzeController);

router.post("/search", searchController);

router.use((req, _, next) => {
	next(new Response(`Cannot ${req.method} ${req.url}, endpoint not available`, 404));
});

module.exports = router;
