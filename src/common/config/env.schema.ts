import * as z from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    error: 'NODE_ENV is required',
  }),
  PORT: z.string({
    error: 'PORT is required',
  }),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  SCYLLA_CONTACT_POINTS: z.string().default("127.0.0.1"),
  SCYLLA_LOCAL_DC: z.string().default("datacenter1"),
  SCYLLA_KEYSPACE: z.string().default("support"),
});
