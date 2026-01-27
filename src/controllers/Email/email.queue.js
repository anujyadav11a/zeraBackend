import Queue from 'bull';
import Redis from 'ioredis';
 
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});
const emailQueue = new Queue('emailQueue', {
    redis: redis
});

export { emailQueue };