declare namespace NodeJS {
  export interface ProcessEnv {

    // GENERAL

    NODE_ENV: `DEVELOPMENT` | `PRODUCTION`;
    SECRET: string;

    // MAIN DATABASE

    MAIN_DATABASE_HOST: string;
    MAIN_DATABASE_PORT: number;
    MAIN_DATABASE_USER: string;
    MAIN_DATABASE_PASS: string;
    MAIN_DATABASE_NAME: string;

    // REDIS

    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;

  }
}
