import type { Preview } from '@storybook/react';
import '../../../packages/ui/src/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      // Enable the docs tab
      enabled: true,
      // Show the docs tab by default
      defaultName: 'Documentation',
    },
  },
};

export default preview;
