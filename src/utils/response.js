class Response {
	constructor(message, status, data = null) {
		if (typeof message === "string") {
			this.message = message.endsWith(".") ? message : message + ".";
		} else {
			throw new Error(`Response class requires a string message, got ${message}`);
		}
		if (typeof status === "number") {
			this.status = status;
		} else {
			throw new Error(`Response class requires a status code, got ${status}`);
		}
		this.data = data;
	}
	toJSON() {
		const clone = { ...(this.data || {}) };
		clone.status = clone.status < 400 ? "ok" : "error";
		if (this.message) clone.message = this.message;
		return JSON.stringify(clone);
	}
}

module.exports = Response;
