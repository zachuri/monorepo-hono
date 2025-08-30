import path from 'node:path';
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../apps/web/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@acme/ui': path.resolve(__dirname, '../../../packages/ui/src'),
        '@acme/web': path.resolve(__dirname, '../../../apps/web/src'),
      };
    }
    return config;
  },
};

export default config;
