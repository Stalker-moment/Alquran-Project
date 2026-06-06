import { EQuran } from "equran";

// Initialize the EQuran client with in-memory caching enabled
export const equran = new EQuran({
  cache: {
    enabled: true,
    ttl: 1000 * 60 * 60, // 1 hour
    maxSize: 200,
  },
  timeout: 15000, // 15 seconds request timeout
});

export default equran;
