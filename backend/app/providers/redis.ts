import {
  createClient,
} from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true,
});

export const redis = async () => {
  await client.connect();

  return client;
};
