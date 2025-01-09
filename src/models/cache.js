class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = Number(process.env.CACHE_TTL_IN_MS) || 15 * 60 * 1000;
  }

  set(key, value) {
    const expirationTime = Date.now() + this.ttl;
    this.cache.set(key, { value, expirationTime });
  }

  get(key) {
    const cacheEntry = this.cache.get(key);
    if (!cacheEntry) {
      return null;
    }
    const { value, expirationTime } = cacheEntry;
    if (Date.now() > expirationTime) {
      this.cache.delete(key);
      return null;
    }
    return value;
  }

  reset() {
    this.cache.clear();
  }

  getKeys() {
    return Array.from(this.cache.keys());
  }
}

module.exports = new Cache();
