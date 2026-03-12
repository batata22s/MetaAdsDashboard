const cache = new Map();

/**
 * Get from cache
 * @param {string} key 
 */
function getCache(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
}

/**
 * Set to cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlMinutes (default 60)
 */
function setCache(key, value, ttlMinutes = 60) {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    cache.set(key, { value, expiry });
}

function clearCache() {
    cache.clear();
}

module.exports = { getCache, setCache, clearCache };
