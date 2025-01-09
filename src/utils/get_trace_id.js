module.exports = function (req, _, next) {
	req.traceId =
		req?.headers?.["x-trace-id"] ||
		req?.body?.["x-trace-id"] ||
		req?.query?.["x-trace-id"] ||
		`trace-${Math.random().toString(36).substring(2, 15)}`;
	next();
};
