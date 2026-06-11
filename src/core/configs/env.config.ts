import { z } from 'zod';

const durationRegex = /^\d+[hmdHMD]$/;

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'local']).default('development'),
  PORT: z.coerce.number().default(4000),

  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string().default('knowledge_hub'),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),

  SALT_ROUNDS: z.coerce.number(),
  JWT_SECRET_KEY: z.string().min(8),
  JWT_SECRET_REFRESH_KEY: z.string().min(8),
  TOKEN_EXPIRE_TIME: z.string().regex(durationRegex, { message: 'Must be a valid time duration format' }),
  TOKEN_REFRESH_EXPIRE_TIME: z.string().regex(durationRegex, { message: 'Must be a valid time duration format' }),

  RATE_LIMIT_TTL: z.coerce.number(),
  RATE_LIMIT: z.coerce.number(),
  RATE_LIMIT_AUTH: z.coerce.number(),
  RATE_LIMIT_AI: z.coerce.number(),

  CACHE_TTL: z.coerce.number(),
  CACHE_TTL_AI: z.coerce.number(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'trace']).default('debug'),
  LOG_MAX_FILE_SIZE: z.coerce.number().default(1024),

  GEMINI_API_KEY: z.string(),
  GEMINI_MODEL: z.string().default('gemini-3.1-flash-lite'),
  GEMINI_MODEL_EMBEDDING: z.string().default('gemini-embedding-2'),

  RAG_VECTOR_DB_PROVIDER: z.string().default('qdrant'),
  RAG_VECTOR_DB_URL: z.string(),
  RAG_VECTOR_COLLECTION: z.string().default('knowledge_hub_articles'),
  RAG_CHUNK_SIZE: z.coerce.number().default(800),
  RAG_CHUNK_OVERLAP: z.coerce.number().default(200),
  RAG_CONVERSATION_MAX_MESSAGES: z.coerce.number().default(20)

})
  .refine((data) => data.JWT_SECRET_REFRESH_KEY !== data.JWT_SECRET_KEY, {
    message: 'JWT_SECRET_REFRESH_KEY cannot be the same as JWT_SECRET_KEY',
    path: ['JWT_SECRET_REFRESH_KEY'],
  });

export type EnvironmentVariables = z.infer<typeof envSchema>;
