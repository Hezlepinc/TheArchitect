export const logger = {
  info: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${msg}`, Object.keys(meta).length ? meta : "");
    }
  },
  warn: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${msg}`, Object.keys(meta).length ? meta : "");
    }
  },
  error: (msg, meta = {}) => {
    // Use console.error in all envs for visibility; swap to real logger later
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${msg}`, Object.keys(meta).length ? meta : "");
  }
};
