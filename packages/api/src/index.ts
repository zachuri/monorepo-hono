import app from '@acme/api/app';

const port = 8787;

// Cloudflare Workers entry point
export default {
  fetch: app.fetch,
  port,
};
