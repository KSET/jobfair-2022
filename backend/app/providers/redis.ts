import Redis from "redis";

export const redis = Redis.createClient({
  url: process.env.REDIS_URL,
});
