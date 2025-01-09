const pino = require("pino");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: true,
    },
  },
  level: process.env.LOG_LEVEL || "info",
});

module.exports = logger;