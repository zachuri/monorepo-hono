import { config } from 'dotenv';
import type { TypeOf } from 'zod';
import { z } from 'zod';

import { EnvSchema } from '@repo/api/types/env';

config({
  path: '.dev.vars',
});

const zodEnv = EnvSchema;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

try {
  zodEnv.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    const { fieldErrors } = err.flatten();
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(', ')}` : field,
      )
      .join('\n  ');
    throw new Error(`Missing environment variables:\n  ${errorMessage}`);
  }
}
