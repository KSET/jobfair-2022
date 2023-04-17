import Redis from "ioredis";

export const newClient = () => {
  return new Redis(process.env.REDIS_URL!, {
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    },
    enableAutoPipelining: true,
    showFriendlyErrorStack: true,
  });
};

const client = newClient();

export const redis = () => {
  return client;
};
