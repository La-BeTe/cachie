const express = require("express");
require("dotenv").config()

const logger = require("./utils/logger");
const getTraceId = require("./utils/get_trace_id");

const app = express();
app.use(express.json());

// Log incoming requests
app.use((req, _, next) => {
    logger.info({
        url: req.url,
        body: req.body,
        query: req.query,
        method: req.method,
    }, "Incoming Request Payload For Trace ID " + getTraceId(req));
    next();
});

app.use("/", (req, res) => res.send("Hello, world!"));

// Fallback error handler
app.use((err, req, res, _) => {
    logger.error(err, "Error Occurred For Trace ID " + getTraceId(req));
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));