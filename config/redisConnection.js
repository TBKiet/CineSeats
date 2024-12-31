const Redis = require('ioredis');
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});
redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

const CACHE_EXPIRATION = 3600; // 1 hour in seconds

async function getCachedData(cacheKey, fetchFunction) {
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] ${cacheKey}`);
            return JSON.parse(cachedData);
        } else {
            const data = await fetchFunction();
            await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_EXPIRATION);
            console.log(`[Cache Miss] ${cacheKey} - Data fetched from DB and cached`);
            return data;
        }
    } catch (error) {
        console.error(`Error accessing cache for ${cacheKey}:`, error);
        // Fallback to fetching data without caching
        return await fetchFunction();
    }
}

module.exports = {
    redis,
    getCachedData,
};