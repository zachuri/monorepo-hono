import type { AppOpenAPI } from '@acme/api/types/app-context';
import { apiReference } from '@scalar/hono-api-reference';
import packageJSON from '../../package.json';

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: 'Tasks API',
    },
  });

  app.get(
    '/reference',
    apiReference({
      theme: 'kepler',
      layout: 'classic',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      url: '/doc',
    }),
  );
}
