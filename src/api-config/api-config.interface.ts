export interface ApiConfig {
  REDIS_HOST: string;
  REDIS_PORT: string;

  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_TTL: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_TTL: string;
}
