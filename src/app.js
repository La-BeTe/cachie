require("dotenv").config();
const cors = require("cors");
const express = require("express");

const router = require("./controllers");
const logger = require("./utils/logger");
const Response = require("./utils/response");
const getTraceId = require("./utils/get_trace_id");

const app = express();

// Middlewares
app.use((_, res, next) => {
	res.setHeader("Content-Type", "application/json");
	next();
});
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, _, next) => {
	logger.info(
		{
			url: req.url,
			body: req.body,
			query: req.query,
			method: req.method,
			headers: req.headers,
		},
		"Incoming request payload for trace-id: " + getTraceId(req),
	);
	next();
});

// Route handler
app.use(router);

// Fallback error handler
app.use((err, req, res, _) => {
	logger.error(err, "Error occurred for trace-id: " + getTraceId(req));
	if (err instanceof SyntaxError && "body" in err && err.status === 400)
		err = new Response("Invalid JSON payload passed", 400);
	const resp = err instanceof Response ? err : new Response("Internal server error occurred", 500);
	res.status(resp.status).send(resp.toJSON());
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
