module.exports = function (req) {
    return req?.headers?.["x-trace-id"] || req?.body?.["x-trace-id"] || req?.query?.["x-trace-id"] || null;
}