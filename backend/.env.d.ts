declare namespace NodeJS {
  export interface ProcessEnv {

    // GENERAL

    NODE_ENV: `DEVELOPMENT` | `PRODUCTION`;
    SECRET: string;
    ORIGIN: string;

    // MAIN DATABASE

    MAIN_DATABASE_HOST: string;
    MAIN_DATABASE_PORT: number;
    MAIN_DATABASE_USER: string;
    MAIN_DATABASE_PASS: string;
    MAIN_DATABASE_NAME: string;

    // EMAILER

    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM_EMAIL: string;

    // MINIO

    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_ROOT_USER: string;
    MINIO_ROOT_PASSWORD: string;

    // REDIS

    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;

  }
}
