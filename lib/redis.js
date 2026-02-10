const Redis = require('ioredis')

// Use VALKEY_URL for DigitalOcean Managed Valkey, fallback to REDIS_URL for backwards compatibility
const valkeyUrl = process.env.VALKEY_URL || process.env.REDIS_URL
module.exports = new Redis(valkeyUrl, { keyPrefix: 'blink' })
