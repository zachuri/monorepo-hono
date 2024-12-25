export type Env = {
  DATABASE_URL: string;
  WORKER_ENV: 'production' | 'development';
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_PRIVATE_KEY: string;
  APPLE_TEAM_ID: string;
  APPLE_WEB_CLIENT_ID: string;
  APPLE_KEY_ID: string;
  API_DOMAIN: string;
  WEB_DOMAIN: string;
  RATE_LIMITER: DurableObjectNamespace;
};
