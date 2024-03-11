//rate limitting using node-cache implementing token bucket algorithm
const NodeCache=require('node-cache');

class TokenBucket {
    constructor(capacity, refillRate) {
        this.capacity = capacity; // Maximum number of tokens the bucket can hold
        this.refillRate = refillRate; // Rate at which tokens are added to the bucket (tokens per second)
        this.tokens = capacity; // Current number of tokens in the bucket
        this.lastRefillTime = Date.now(); // Timestamp of the last token refill
    }

    consume(tokens) {
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - this.lastRefillTime) / 1000;

        // Refill the bucket based on elapsed time
        const refillAmount = elapsedSeconds * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + refillAmount);
        this.lastRefillTime = currentTime;

        // Check if there are enough tokens to fulfill the request
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true; // Tokens consumed successfully
        } else {
            return false; // Insufficient tokens
        }
    }
}

class RateLimiter {
    constructor(capacity, refillRate) {
        this.capacity = capacity; // Maximum number of tokens per IP address
        this.refillRate = refillRate; // Rate at which tokens are added per IP address (tokens per second)
        this.cache = new NodeCache(); // NodeCache instance to store token buckets for each IP address
    }

    consume(ip, tokens) {
        let bucket = this.cache.get(ip);

        if (!bucket) {
            bucket = new TokenBucket(this.capacity, this.refillRate);
            this.cache.set(ip, bucket);
        }

        return bucket.consume(tokens);
    }
}

const capacity = 10; // Maximum number of tokens per IP address
const refillRate = 1; // Tokens per second per IP address
const rateLimiter = new RateLimiter(capacity, refillRate);

// Middleware function to enforce rate limiting
function rateLimitMiddleware(req, res, next) {
    const clientIP = req.ip; // Get the client's IP address from the request
    if (rateLimiter.consume(clientIP, 1)) {
        next(); // Continue to the next middleware or route handler
    } else {
        res.status(429).send('Rate limit exceeded. Please try again later.'); // Send 429 Too Many Requests error
    }
}

module.exports=rateLimitMiddleware;